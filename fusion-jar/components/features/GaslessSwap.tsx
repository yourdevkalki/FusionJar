"use client";

import { useState, useEffect } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { toast } from "react-hot-toast";
import { SUPPORTED_CHAINS, TOKENS } from "../../lib/tokens";
import {
  FusionSDK,
  NetworkEnum,
  OrderStatus as FusionOrderStatus,
  PrivateKeyProviderConnector,
} from "@1inch/fusion-sdk";
import { JsonRpcProvider, computeAddress, formatUnits } from "ethers";
import { Web3 } from "web3";

interface Quote {
  dstAmount: string;
  estimatedGas?: string;
  protocols?: any[];
  fusionQuote?: any;
  preset?: string;
  auctionStartAmount?: string;
  auctionEndAmount?: string;
  isGasless?: boolean;
}

interface FusionOrder {
  id: string;
  status: string;
  phase: string;
  orderData?: any;
  orderHash?: string;
  message?: string;
  timestamp?: number;
  isFusion?: boolean;
  isGasless?: boolean;
}

interface OrderStatus {
  orderHash: string;
  status: string;
  phase: string;
  message: string;
  fills?: any[];
  timestamp: number;
  isFusion?: boolean;
  isGasless?: boolean;
}

export default function GaslessSwap() {
  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [selectedSrcToken, setSelectedSrcToken] = useState(
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  ); // USDC
  const [selectedDstToken, setSelectedDstToken] = useState(
    "0x4200000000000000000000000000000000000006"
  ); // WETH
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [fusionOrder, setFusionOrder] = useState<FusionOrder | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [swapStatus, setSwapStatus] = useState<
    | "idle"
    | "quoting"
    | "creating"
    | "signing"
    | "submitting"
    | "monitoring"
    | "success"
    | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [fusionSDK, setFusionSDK] = useState<FusionSDK | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const { signTypedDataAsync } = useSignTypedData();

  // Initialize Fusion SDK and Web3
  const initializeFusionSDK = async () => {
    if (!address || fusionSDK) return;

    setIsInitializing(true);
    try {
      // Get user's private key (this would need to be securely provided by the user)
      // For demo purposes, we'll use a placeholder - in production, this should be handled securely
      const privateKey = process.env.NEXT_PUBLIC_DEMO_PRIVATE_KEY;

      if (!privateKey) {
        toast.error("Demo private key not configured");
        return;
      }

      const NODE_URL =
        process.env.NEXT_PUBLIC_BASE_RPC_URL ||
        "https://base-mainnet.infura.io/v3/your-key";
      const DEV_PORTAL_API_TOKEN = process.env.NEXT_PUBLIC_ONE_INCH_API_KEY;

      if (!DEV_PORTAL_API_TOKEN) {
        toast.error("1inch API key not configured");
        return;
      }

      // Initialize Web3 for token approvals
      const baseWeb3 = new Web3(NODE_URL);
      setWeb3(baseWeb3);

      const ethersRpcProvider = new JsonRpcProvider(NODE_URL);

      const ethersProviderConnector = {
        eth: {
          call: function (transactionConfig: any) {
            return ethersRpcProvider.call(transactionConfig);
          },
        },
        extend: function () {},
      };

      const connector = new PrivateKeyProviderConnector(
        privateKey,
        ethersProviderConnector
      );

      const sdk = new FusionSDK({
        url: "https://api.1inch.dev/fusion",
        network: NetworkEnum.COINBASE,
        blockchainProvider: connector,
        authKey: DEV_PORTAL_API_TOKEN,
      });

      setFusionSDK(sdk);
      toast.success("Fusion SDK initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize Fusion SDK:", error);
      toast.error("Failed to initialize Fusion SDK");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Fusion SDK when user connects
  useEffect(() => {
    if (isConnected && address && !fusionSDK && !isInitializing) {
      initializeFusionSDK();
    }
  }, [isConnected, address, fusionSDK, isInitializing]);

  // Helper function to normalize private key
  const normalizeKey = (rawKey: string) => {
    return rawKey.startsWith("0x") ? rawKey : "0x" + rawKey;
  };

  // Helper function to sleep
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Check and approve USDC for Fusion
  const checkAndApproveUSDC = async () => {
    if (!web3 || !address || !quote?.fusionQuote) {
      throw new Error("Web3, address, or quote not available");
    }

    const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    const usdcAbi = [
      {
        constant: true,
        inputs: [
          { name: "_owner", type: "address" },
          { name: "_spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { name: "_spender", type: "address" },
          { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const usdcContract = new web3.eth.Contract(usdcAbi, usdcAddress);

    // Get settlement address from quote
    const fusionSpender = quote.fusionQuote.settlementAddress;
    if (!fusionSpender) {
      throw new Error("Settlement address not found in quote");
    }

    console.log("Using Fusion spender address:", fusionSpender);
    console.log("Checking allowance for address:", address);

    let currentAllowance: string;
    let requiredAmount: number;

    try {
      currentAllowance = await usdcContract.methods
        .allowance(address, fusionSpender)
        .call({ from: address });
      requiredAmount = parseFloat(amount) * 1e6; // USDC amount in smallest units

      console.log("Current allowance:", Number(currentAllowance) / 1e6, "USDC");
      console.log("Required amount:", requiredAmount / 1e6, "USDC");
    } catch (error) {
      console.error("Error checking allowance:", error);
      throw new Error(
        `Failed to check allowance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    if (Number(currentAllowance) < requiredAmount) {
      console.log("❌ Insufficient allowance. Approving USDC...");

      const privateKey = process.env.NEXT_PUBLIC_DEMO_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("Private key not configured");
      }

      const approveAmount = "1000000000"; // 1000 USDC allowance
      const approveTx = usdcContract.methods.approve(
        fusionSpender,
        approveAmount
      );
      const gasEstimate = await approveTx.estimateGas({ from: address });

      const signedTx = await web3.eth.accounts.signTransaction(
        {
          to: usdcAddress,
          data: approveTx.encodeABI(),
          gas: Math.floor(Number(gasEstimate) * 1.2),
          gasPrice: await web3.eth.getGasPrice(),
          nonce: await web3.eth.getTransactionCount(address),
        },
        normalizeKey(privateKey)
      );

      console.log("Sending approval transaction...");
      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );
      console.log(
        "✅ USDC approval successful! Hash:",
        receipt.transactionHash
      );

      // Wait for the transaction to be processed
      await sleep(3000);
    } else {
      console.log("✅ Sufficient USDC allowance already exists");
    }
  };

  const getPhaseText = () => {
    if (!orderStatus) return "";

    switch (orderStatus.phase) {
      case "announcement":
        return "📢 Phase 1: Dutch auction in progress - resolvers competing";
      case "deposit":
        return "🏦 Phase 2: Resolver depositing assets to escrow contracts";
      case "withdrawal":
        return "🔓 Phase 3: Unlocking assets and completing gasless swap";
      default:
        return orderStatus.message || "";
    }
  };

  const getStatusText = () => {
    switch (swapStatus) {
      case "quoting":
        return "Getting Fusion quote...";
      case "creating":
        return "Creating Fusion order...";
      case "submitting":
        return "Submitting to Fusion relayer...";
      case "monitoring":
        return orderStatus
          ? getPhaseText()
          : "Monitoring Fusion swap progress...";
      case "success":
        return "🎉 Fusion swap completed successfully!";
      case "error":
        return "❌ Fusion swap failed - try again";
      default:
        return "Ready for Fusion swap";
    }
  };

  const getQuote = async () => {
    if (!isConnected || !address || !amount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    setSwapStatus("quoting");
    setError(null);

    try {
      const response = await fetch("/api/fusion/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromTokenAddress: selectedSrcToken,
          toTokenAddress: selectedDstToken,
          amount: (parseFloat(amount) * Math.pow(10, 6)).toString(), // USDC has 6 decimals
          walletAddress: address,
          source: "fusion-ui-demo",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get quote");
      }

      const fusionQuote = await response.json();
      console.log("Fusion quote response:", fusionQuote);
      console.log("Settlement address:", fusionQuote.settlementAddress);

      // Convert Fusion API quote to our Quote interface
      // Handle different possible response structures
      let dstAmount = "0";
      let auctionStartAmount = "0";
      let auctionEndAmount = "0";

      // Use toTokenAmount as the primary amount (this is the main quote amount)
      if (fusionQuote.toTokenAmount) {
        dstAmount = fusionQuote.toTokenAmount;
      }

      // Check for recommended_preset (with underscore) first
      if (fusionQuote.presets && fusionQuote.recommended_preset) {
        const recommendedPreset =
          fusionQuote.presets[fusionQuote.recommended_preset];
        if (recommendedPreset) {
          auctionStartAmount =
            recommendedPreset.auctionStartAmount?.toString() || "0";
          auctionEndAmount =
            recommendedPreset.auctionEndAmount?.toString() || "0";
        }
      } else if (fusionQuote.presets && fusionQuote.recommendedPreset) {
        // Fallback to camelCase
        const recommendedPreset =
          fusionQuote.presets[fusionQuote.recommendedPreset];
        if (recommendedPreset) {
          auctionStartAmount =
            recommendedPreset.auctionStartAmount?.toString() || "0";
          auctionEndAmount =
            recommendedPreset.auctionEndAmount?.toString() || "0";
        }
      } else {
        // Fallback to using toTokenAmount for all values
        auctionStartAmount = fusionQuote.toTokenAmount || "0";
        auctionEndAmount = fusionQuote.toTokenAmount || "0";
      }

      const quoteData: Quote = {
        dstAmount: dstAmount,
        auctionStartAmount: auctionStartAmount,
        auctionEndAmount: auctionEndAmount,
        fusionQuote: fusionQuote,
        isGasless: true,
      };

      setQuote(quoteData);
      toast.success("Fusion quote received!");
    } catch (error) {
      console.error("Fusion quote error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to get Fusion quote"
      );
      toast.error("Failed to get Fusion quote");
    } finally {
      setSwapStatus("idle");
    }
  };

  const executeGaslessSwap = async () => {
    if (!isConnected || !address || !amount || !quote) {
      toast.error("Please connect wallet, enter amount, and get quote first");
      return;
    }

    setSwapStatus("creating");
    setError(null);

    try {
      // Step 1: Check and approve USDC (if we have web3)
      if (web3) {
        try {
          console.log("Checking USDC approval...");
          await checkAndApproveUSDC();
        } catch (error) {
          console.warn(
            "USDC approval failed, continuing without approval:",
            error
          );
          // Continue without approval - the backend will handle it
        }
      }

      // Step 2: Create and submit Fusion order using backend API
      let orderInfo;
      const orderResponse = await fetch("/api/fusion/real-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromTokenAddress: selectedSrcToken,
          toTokenAddress: selectedDstToken,
          amount: (parseFloat(amount) * Math.pow(10, 6)).toString(), // USDC has 6 decimals
          walletAddress: address,
          source: "fusion-ui-demo",
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();

        // Handle USDC approval requirement
        if (errorData.needsApproval && errorData.settlementContract) {
          console.log(
            "USDC approval required for settlement contract:",
            errorData.settlementContract
          );

          // Trigger USDC approval for Fusion settlement contract
          console.log("Triggering USDC approval...");
          await checkAndApproveUSDC();

          // Retry the order creation after approval
          const retryResponse = await fetch("/api/fusion/real-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fromTokenAddress: selectedSrcToken,
              toTokenAddress: selectedDstToken,
              amount: (parseFloat(amount) * Math.pow(10, 6)).toString(),
              walletAddress: address,
              source: "fusion-ui-demo",
            }),
          });

          if (!retryResponse.ok) {
            const retryErrorData = await retryResponse.json();
            throw new Error(
              retryErrorData.error || "Failed to create order after approval"
            );
          }

          const retryOrderInfo = await retryResponse.json();
          orderInfo = retryOrderInfo;
        } else {
          throw new Error(errorData.error || "Failed to create order");
        }
      } else {
        orderInfo = await orderResponse.json();
      }
      console.log("Order submitted:", orderInfo.orderHash);

      // Create FusionOrder object for UI
      const order: FusionOrder = {
        id: orderInfo.orderHash,
        status: "submitted",
        phase: "announcement",
        orderHash: orderInfo.orderHash,
        message: "Order submitted to Fusion relayer",
        timestamp: Date.now(),
        isFusion: true,
        isGasless: true,
      };

      setFusionOrder(order);
      setSwapStatus("monitoring");
      toast.success("🎉 Fusion order submitted successfully!");

      // Step 3: Monitor order status
      const start = Date.now();
      const checkStatus = async () => {
        try {
          const statusResponse = await fetch(
            `/api/fusion/real-status?orderHash=${orderInfo.orderHash}`
          );

          if (!statusResponse.ok) {
            console.error("Failed to check order status");
            setTimeout(checkStatus, 3000);
            return;
          }

          const data = await statusResponse.json();
          console.log("Order status:", data);

          const orderStatus: OrderStatus = {
            orderHash: orderInfo.orderHash,
            status: data.status,
            phase: data.status === "Filled" ? "withdrawal" : "announcement",
            message: `Order status: ${data.status}`,
            fills: data.fills,
            timestamp: Date.now(),
            isFusion: true,
            isGasless: true,
          };

          setOrderStatus(orderStatus);

          if (data.status === "Filled") {
            setSwapStatus("success");
            toast.success("🎉 Fusion swap completed successfully!");
            console.log("Order filled:", data.fills);
            console.log(
              "Order executed in",
              (Date.now() - start) / 1000,
              "seconds"
            );
            return;
          }

          if (data.status === "Expired") {
            setSwapStatus("error");
            setError("Order expired");
            toast.error("Order expired");
            return;
          }

          if (data.status === "Cancelled") {
            setSwapStatus("error");
            setError("Order cancelled");
            toast.error("Order cancelled");
            return;
          }

          // Continue monitoring
          setTimeout(checkStatus, 3000);
        } catch (err) {
          console.error("Error checking order status:", err);
          setTimeout(checkStatus, 3000);
        }
      };

      // Start monitoring
      setTimeout(checkStatus, 3000);
    } catch (error) {
      console.error("Fusion swap error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to execute Fusion swap"
      );
      setSwapStatus("error");
      toast.error("Failed to execute Fusion swap");
    }
  };

  const resetForm = () => {
    setAmount("");
    setQuote(null);
    setFusionOrder(null);
    setOrderStatus(null);
    setSwapStatus("idle");
    setError(null);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Wallet for Fusion Swaps
          </h2>
          <p className="text-gray-600">
            Please connect your wallet to start swapping tokens using the Fusion
            SDK.
          </p>
        </div>
      </div>
    );
  }

  const baseTokens = TOKENS.filter((token) => token.chainId === 8453);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Fusion SDK Swap
          </h2>
          <p className="text-gray-600">
            Experience gasless swaps with MEV protection using 1inch Fusion SDK
          </p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
            ⚡ Gasless • 🛡️ MEV Protected • 🚀 Relayer Network
          </div>
        </div>

        <div className="space-y-4">
          {/* Source Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Token
            </label>
            <select
              value={selectedSrcToken}
              onChange={(e) => setSelectedSrcToken(e.target.value)}
              disabled={swapStatus !== "idle"}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              {baseTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Token
            </label>
            <select
              value={selectedDstToken}
              onChange={(e) => setSelectedDstToken(e.target.value)}
              disabled={swapStatus !== "idle"}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              {baseTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={swapStatus !== "idle"}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Status Display */}
          <div className="text-center py-4">
            <div
              className={`text-sm font-medium ${
                swapStatus === "success"
                  ? "text-green-600"
                  : swapStatus === "error"
                  ? "text-red-600"
                  : swapStatus !== "idle"
                  ? "text-purple-600"
                  : "text-gray-600"
              }`}
            >
              {getStatusText()}
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>

          {/* Fusion Progress Indicator */}
          {orderStatus && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">
                Fusion SDK Progress
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      orderStatus.phase === "announcement"
                        ? "bg-purple-500 animate-pulse"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-sm text-purple-800">
                    Phase 1: Order Submitted (Relayer)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      orderStatus.phase === "deposit"
                        ? "bg-purple-500 animate-pulse"
                        : orderStatus.phase === "withdrawal"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-purple-800">
                    Phase 2: Processing (Relayer)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      orderStatus.phase === "withdrawal"
                        ? "bg-purple-500 animate-pulse"
                        : orderStatus.status === "Filled"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-purple-800">
                    Phase 3: Completed (Relayer)
                  </span>
                </div>
              </div>
              <div className="text-xs text-purple-600 mt-2">
                {orderStatus.message}
              </div>
            </div>
          )}

          {/* Quote Preview */}
          {quote && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">
                Fusion SDK Quote
              </h3>
              <div className="text-sm text-purple-700 space-y-1">
                <div>
                  You will receive:{" "}
                  {(parseFloat(quote.dstAmount) / Math.pow(10, 18)).toFixed(6)}{" "}
                  WETH
                </div>
                {quote.auctionStartAmount &&
                  parseFloat(quote.auctionStartAmount) > 0 && (
                    <div>
                      Auction range:{" "}
                      {(
                        parseFloat(quote.auctionStartAmount) / Math.pow(10, 18)
                      ).toFixed(6)}{" "}
                      →{" "}
                      {(
                        parseFloat(quote.auctionEndAmount!) / Math.pow(10, 18)
                      ).toFixed(6)}{" "}
                      WETH
                    </div>
                  )}
                <div className="text-xs text-gray-600 mt-1">
                  Quote ID: {quote.fusionQuote?.quoteId || "N/A"}
                </div>
                <div className="text-green-600 font-medium text-center mt-2 p-2 bg-green-50 rounded">
                  ✅ GASLESS • RELAYER EXECUTION
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={getQuote}
              disabled={swapStatus !== "idle" || !amount}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Get Fusion Quote
            </button>

            <button
              onClick={executeGaslessSwap}
              disabled={swapStatus !== "idle" || !quote}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              🚀 Execute Fusion Swap
            </button>

            {(swapStatus === "success" || swapStatus === "error") && (
              <button
                onClick={resetForm}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                New Fusion Swap
              </button>
            )}
          </div>

          {/* Fusion Benefits */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-green-600 font-medium">Gasless</div>
                <div>Execution</div>
              </div>
              <div>
                <div className="text-purple-600 font-medium">MEV</div>
                <div>Protected</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Relayer</div>
                <div>Network</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
