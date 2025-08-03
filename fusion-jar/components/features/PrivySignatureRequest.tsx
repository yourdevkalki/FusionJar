"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";

// ERC20 ABI for token approval
const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

// Fusion contract addresses (1inch Fusion)
const FUSION_CONTRACTS = {
  1: "0x1111111254EEB25477B68fb85Ed929f73A960582", // Ethereum
  137: "0x1111111254EEB25477B68fb85Ed929f73A960582", // Polygon
  56: "0x1111111254EEB25477B68fb85Ed929f73A960582", // BSC
  8453: "0x1111111254EEB25477B68fb85Ed929f73A960582", // Base
};

interface FinalAuthorizationProps {
  jarData: {
    jarName: string;
    amount: number;
    frequency: string;
    startDate: string;
    walletAddress: string;
    tokenSymbol: string; // Token being purchased (e.g., SPX)
    sourceChain: number;
    targetChain: number;
    minSlippage: number;
    tokenAddress: string; // Add token address for approval
  };
  onAuthorize: () => void;
  onCancel: () => void;
}

export default function FinalAuthorization({
  jarData,
  onAuthorize,
  onCancel,
}: FinalAuthorizationProps) {
  const {
    primaryWallet,
    authenticated,
    isConnected,
    createEmbeddedWallet,
    wallets,
  } = useAuth();

  // Debug logging
  console.log("🔍 FinalAuthorization Debug:");
  console.log("- authenticated:", authenticated);
  console.log("- isConnected:", isConnected);
  console.log("- ALL wallets:", wallets);
  console.log("- wallets count:", wallets?.length || 0);

  // Check wallet types
  if (wallets && wallets.length > 0) {
    wallets.forEach((wallet, index) => {
      console.log(`- wallet[${index}]:`, {
        address: wallet.address,
        walletClientType: wallet.walletClientType,
        connectorType: wallet.connectorType,
      });
    });

    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
    const externalWallet = wallets.find((w) => w.walletClientType !== "privy");

    console.log("- embeddedWallet found:", !!embeddedWallet);
    console.log("- externalWallet found:", !!externalWallet);
  }

  console.log("- primaryWallet:", primaryWallet);
  if (primaryWallet) {
    console.log("- primaryWallet keys:", Object.keys(primaryWallet));
    console.log("- walletClient:", primaryWallet.walletClient);
    console.log("- walletClientType:", primaryWallet.walletClientType);
    console.log("- provider:", primaryWallet.provider);
    console.log(
      "- getEthereumProvider method:",
      typeof primaryWallet.getEthereumProvider
    );

    // Test if getEthereumProvider exists and works
    if (typeof primaryWallet.getEthereumProvider === "function") {
      primaryWallet
        .getEthereumProvider()
        .then((provider: any) => {
          console.log("- getEthereumProvider() result:", provider);
        })
        .catch((err: any) => {
          console.log("- getEthereumProvider() error:", err);
        });
    }

    // Check for other potential provider methods
    console.log("- connector:", primaryWallet.connector);
    console.log("- client:", primaryWallet.client);
  }

  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNeeded, setApprovalNeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingEmbeddedWallet, setIsCreatingEmbeddedWallet] =
    useState(false);

  // Check if user is using external wallet when embedded is preferred
  const isUsingExternalWallet = primaryWallet?.walletClientType !== "privy";
  const hasEmbeddedWallet = wallets?.some(
    (w) => w.walletClientType === "privy"
  );

  // Auto-create embedded wallet for better UX
  const handleCreateEmbeddedWallet = async () => {
    try {
      setIsCreatingEmbeddedWallet(true);
      setError(null);
      console.log("🔄 Creating embedded wallet...");
      await createEmbeddedWallet();
      console.log("✅ Embedded wallet created successfully");
    } catch (error: any) {
      console.error("❌ Failed to create embedded wallet:", error);

      // Handle user rejection gracefully
      if (
        error?.code === 4001 ||
        error?.code === "ACTION_REJECTED" ||
        error?.message?.includes("user rejected") ||
        error?.message?.includes("User denied")
      ) {
        console.log("ℹ️ User cancelled embedded wallet creation");
        toast.error("Embedded wallet creation cancelled by user");
        return;
      }

      setError(
        `Failed to create embedded wallet: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCreatingEmbeddedWallet(false);
    }
  };

  // Check if token approval is needed
  const checkTokenApproval = async () => {
    try {
      setIsCheckingApproval(true);
      console.log("🔍 Checking token approval...");
      console.log("Primary wallet:", primaryWallet);
      console.log("Token address:", jarData.tokenAddress);
      console.log("Source chain:", jarData.sourceChain);

      // Check if user is authenticated
      if (!authenticated) {
        console.error("❌ User not authenticated");
        setError("Please log in to continue.");
        return false;
      }

      // Check if we have valid data
      if (!jarData.tokenAddress || jarData.tokenAddress.trim() === "") {
        console.error("❌ No token address provided");
        setError("No token address provided");
        return false;
      }

      if (!primaryWallet) {
        console.error("❌ No primary wallet found");
        setError("Wallet not connected. Please connect your wallet first.");
        return false;
      }

      // Try the correct Privy method first
      let provider;
      try {
        if (typeof primaryWallet.getEthereumProvider === "function") {
          console.log("🔄 Using getEthereumProvider() method...");
          const privyProvider = await primaryWallet.getEthereumProvider();
          provider = new ethers.BrowserProvider(privyProvider);
          console.log(
            "✅ Successfully created provider with getEthereumProvider"
          );
        } else {
          console.log("🔄 Falling back to walletClient...");
          // Fallback to wallet client
          const walletClient =
            primaryWallet.walletClient || primaryWallet.provider;
          if (!walletClient) {
            throw new Error("No wallet client or provider available");
          }
          provider = new ethers.BrowserProvider(walletClient);
          console.log("✅ Successfully created provider with walletClient");
        }
      } catch (error) {
        console.error("❌ Failed to create provider:", error);
        console.log("Available wallet properties:", Object.keys(primaryWallet));
        setError(
          `Failed to create provider: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        return false;
      }
      const signer = await provider.getSigner();
      
      // Validate token address
      if (!jarData.tokenAddress || !ethers.isAddress(jarData.tokenAddress)) {
        setError(`Invalid token address: ${jarData.tokenAddress}`);
        return false;
      }
      
      console.log(`🔍 Creating token contract for approval check: ${jarData.tokenAddress}`);
      const tokenContract = new ethers.Contract(
        jarData.tokenAddress,
        ERC20_ABI,
        signer
      );

      const userAddress = await signer.getAddress();
      console.log("User address:", userAddress);

      const spenderAddress =
        FUSION_CONTRACTS[jarData.sourceChain as keyof typeof FUSION_CONTRACTS];
      console.log("Spender address:", spenderAddress);

      if (!spenderAddress) {
        console.error(
          "❌ Fusion contract not found for chain:",
          jarData.sourceChain
        );
        setError("Fusion contract not found for this chain");
        return false;
      }

      const allowance = await tokenContract.allowance(
        userAddress,
        spenderAddress
      );
      console.log("Current allowance:", allowance.toString());

      const approvalAmount = ethers.parseUnits("1000000", 18); // 1M tokens
      console.log("Required approval amount:", approvalAmount.toString());

      const isApproved = allowance >= approvalAmount;
      console.log("Is approved:", isApproved);

      setApprovalNeeded(!isApproved);

      return isApproved;
    } catch (error: any) {
      console.error("❌ Error checking token approval:", error);

      // Handle user rejection gracefully
      if (
        error?.code === 4001 ||
        error?.code === "ACTION_REJECTED" ||
        error?.message?.includes("user rejected") ||
        error?.message?.includes("User denied")
      ) {
        console.log("ℹ️ User rejected token approval check");
        toast.error("Token approval cancelled by user");
        onCancel(); // Navigate back to create page
        return false;
      }

      setError(
        `Failed to check token approval: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    } finally {
      setIsCheckingApproval(false);
    }
  };

  // Request token approval
  const requestTokenApproval = async () => {
    try {
      setIsApproving(true);
      setError(null);

      // Check if user is authenticated
      if (!authenticated) {
        console.error("❌ User not authenticated for approval");
        setError("Please log in to continue.");
        return false;
      }

      if (!primaryWallet) {
        setError("Wallet not connected. Please connect your wallet first.");
        return false;
      }

      // Try the correct Privy method first
      let provider;
      try {
        if (typeof primaryWallet.getEthereumProvider === "function") {
          console.log("🔄 Using getEthereumProvider() method for approval...");
          const privyProvider = await primaryWallet.getEthereumProvider();
          provider = new ethers.BrowserProvider(privyProvider);
          console.log(
            "✅ Successfully created provider with getEthereumProvider for approval"
          );
        } else {
          console.log("🔄 Falling back to walletClient for approval...");
          // Fallback to wallet client
          const walletClient =
            primaryWallet.walletClient || primaryWallet.provider;
          if (!walletClient) {
            throw new Error(
              "No wallet client or provider available for approval"
            );
          }
          provider = new ethers.BrowserProvider(walletClient);
          console.log(
            "✅ Successfully created provider with walletClient for approval"
          );
        }
      } catch (error) {
        console.error("❌ Failed to create provider for approval:", error);
        console.log("Available wallet properties:", Object.keys(primaryWallet));
        setError(
          `Failed to create provider for approval: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        return false;
      }
      const signer = await provider.getSigner();
      
      // Validate token address
      if (!jarData.tokenAddress || !ethers.isAddress(jarData.tokenAddress)) {
        setError(`Invalid token address: ${jarData.tokenAddress}`);
        return false;
      }
      
      console.log(`🔍 Creating token contract for: ${jarData.tokenAddress}`);
      const tokenContract = new ethers.Contract(
        jarData.tokenAddress,
        ERC20_ABI,
        signer
      );

      const spenderAddress =
        FUSION_CONTRACTS[jarData.sourceChain as keyof typeof FUSION_CONTRACTS];

      if (!spenderAddress) {
        setError("Fusion contract not found for this chain");
        return false;
      }

      // Get token info for better UX with fallbacks
      let tokenSymbol = jarData.tokenSymbol || "Token";
      let tokenName = "Token";
      
      try {
        // Try to get token info, but provide fallbacks if it fails
        const tokenInfo = await Promise.allSettled([
          tokenContract.symbol(),
          tokenContract.name(),
        ]);
        
        if (tokenInfo[0].status === "fulfilled" && tokenInfo[0].value) {
          tokenSymbol = tokenInfo[0].value;
        }
        if (tokenInfo[1].status === "fulfilled" && tokenInfo[1].value) {
          tokenName = tokenInfo[1].value;
        }
        
        console.log(`✅ Token info retrieved: ${tokenSymbol} (${tokenName})`);
      } catch (error) {
        console.warn("⚠️ Could not retrieve token info, using fallbacks:", error);
        // Continue with fallback values
      }

      toast.loading(`Approving ${tokenSymbol} for automated investments...`);

      // Approve with maximum amount
      const approveTx = await tokenContract.approve(
        spenderAddress,
        ethers.MaxUint256
      );

      toast.loading("Waiting for approval confirmation...");
      await approveTx.wait();

      toast.success(`${tokenSymbol} approved successfully!`);
      setApprovalNeeded(false);

      return true;
    } catch (error: any) {
      console.error("Error approving token:", error);

      // Handle user rejection gracefully
      if (
        error?.code === 4001 ||
        error?.code === "ACTION_REJECTED" ||
        error?.message?.includes("user rejected") ||
        error?.message?.includes("User denied")
      ) {
        console.log("ℹ️ User rejected token approval");
        toast.error("Token approval cancelled by user");
        onCancel(); // Navigate back to create page
        return false;
      }

      setError("Failed to approve token");
      toast.error("Failed to approve token");
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  const handleAuthorize = async () => {
    try {
      setError(null);
      setIsAuthorizing(true);

      console.log("🚀 Starting final authorization for jar creation:", jarData);

      // First check if token approval is needed
      console.log("🔍 Checking if token approval is needed...");
      const isApproved = await checkTokenApproval();
      console.log("✅ Approval check result:", isApproved);

      if (!isApproved) {
        console.log("⚠️ Token approval needed, requesting approval...");
        // If approval is needed, request it
        const approved = await requestTokenApproval();
        console.log("✅ Approval request result:", approved);
        if (!approved) {
          console.error("❌ Token approval failed");
          setError("Token approval is required to create the investment jar");
          return;
        }
      }

      console.log(
        "✅ Token approval successful, proceeding with jar creation..."
      );

      // Simulate authorization process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Authorize jar creation
      onAuthorize();
    } catch (err: any) {
      console.error("❌ Error authorizing jar creation:", err);

      // Handle user rejection gracefully
      if (
        err?.code === 4001 ||
        err?.code === "ACTION_REJECTED" ||
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User denied")
      ) {
        console.log("ℹ️ User cancelled jar creation");
        toast.error("Jar creation cancelled by user");
        onCancel(); // Navigate back to create page
        return;
      }

      setError(
        `Failed to authorize jar creation: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl shadow-2xl shadow-[var(--primary)]/20 p-6 max-w-md mx-auto border border-[var(--border-color)]">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--on-surface-strong)] mb-2">
          Final Authorization
        </h3>
        <p className="text-sm text-[var(--on-surface)]">
          Review and authorize your investment jar creation
        </p>
      </div>

      <div className="bg-[var(--background)] rounded-xl p-4 mb-6 border border-[var(--border-color)]">
        <h4 className="font-medium text-[var(--on-surface-strong)] mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Jar Details
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[var(--on-surface)]">Jar Name:</span>
            <span className="font-medium text-[var(--on-surface-strong)]">
              {jarData.jarName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--on-surface)]">Amount:</span>
            <span className="font-medium text-[var(--on-surface-strong)]">
              ${jarData.amount} USD
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--on-surface)]">Frequency:</span>
            <span className="font-medium text-[var(--on-surface-strong)]">
              {jarData.frequency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--on-surface)]">Token to Buy:</span>
            <span className="font-medium text-[var(--on-surface-strong)]">
              {jarData.tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--on-surface)]">Start Date:</span>
            <span className="font-medium text-[var(--on-surface-strong)]">
              {jarData.startDate}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--on-surface)]">Slippage:</span>
            <span className="font-medium text-[var(--on-surface-strong)]">
              {jarData.minSlippage}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--on-surface)]">Wallet Address:</span>
            <span className="font-medium text-[var(--on-surface-strong)] text-xs">
              {jarData.walletAddress.slice(0, 6)}...
              {jarData.walletAddress.slice(-4)}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Type Warning */}
      {isUsingExternalWallet && !hasEmbeddedWallet && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-500 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-yellow-700 text-sm font-medium mb-2">
                External Wallet Detected
              </p>
              <p className="text-yellow-600 text-sm mb-3">
                You're using MetaMask wallet. For the best gasless experience,
                create a Privy embedded wallet.
              </p>
              <button
                onClick={handleCreateEmbeddedWallet}
                disabled={isCreatingEmbeddedWallet}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingEmbeddedWallet
                  ? "Creating..."
                  : "Create Embedded Wallet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isUsingExternalWallet && hasEmbeddedWallet && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-blue-600 text-sm">
              Using external wallet. You have an embedded wallet available for
              gasless transactions.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={handleAuthorize}
          disabled={isAuthorizing}
          className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthorizing ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isApproving ? "Approving Token..." : "Creating Jar..."}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Create Jar
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isAuthorizing}
          className="flex-1 bg-[var(--background)] text-[var(--on-surface)] px-4 py-2 rounded-lg hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[var(--border-color)]"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 text-xs text-[var(--on-surface)] text-center">
        <p>
          By creating this jar, you authorize FusionJar to automatically execute
          investments using your wallet. Your wallet address and jar data will
          be stored securely.
        </p>
      </div>
    </div>
  );
}
