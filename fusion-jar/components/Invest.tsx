"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { CreateInvestmentFormData } from "@/types/investment";
import { TokenSearchResult } from "@/types/investment";
import FinalAuthorization from "./features/PrivySignatureRequest";
import { ethers } from "ethers";

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

export default function Invest() {
  const { address, authenticatedFetch, primaryWallet } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenSearchResult, setTokenSearchResult] =
    useState<TokenSearchResult | null>(null);
  const [quote] = useState<{
    toAmount: string;
    fromAmount: string;
    estimatedGas: string;
  } | null>(null);
  const [showFinalAuthorization, setShowFinalAuthorization] = useState(false);
  const [jarAuthorized, setJarAuthorized] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState<{
    [key: string]: boolean;
  }>({});

  // Load approval status from localStorage on mount
  useEffect(() => {
    const loadApprovalStatus = () => {
      const stored = localStorage.getItem("approvalStatus");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setApprovalStatus(parsed);
        } catch (error) {
          console.error("Error parsing stored approval status:", error);
        }
      }
    };

    loadApprovalStatus();
  }, []);

  // Form data state
  const [formData, setFormData] = useState({
    sourceChain: 1,
    targetChain: 137,
    sourceToken: "",
    targetToken: "",
    amount: "",
    tokenAddress: "",
    frequency: "weekly",
    customDays: "",
    startDate: new Date().toISOString().split("T")[0],
    jarName: "",
    saveAsTemplate: false,
    gasLimit: "",
    minSlippage: "0.5",
    deadline: "20",
    stopSwaps: "",
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setShowFinalAuthorization(false);
    setJarAuthorized(false);
  };

  const handleJarAuthorized = () => {
    setJarAuthorized(true);
    setShowFinalAuthorization(false);
    toast.success("Jar authorized! Creating investment jar...");
  };

  const handleJarCancel = () => {
    setShowFinalAuthorization(false);
    toast.error("Jar creation cancelled.");
  };

  // Check if token approval is needed
  // const checkTokenApproval = async (tokenAddress: string, chainId: number) => {
  //   if (!primaryWallet?.address || !primaryWallet?.provider) {
  //     toast.error("Wallet not connected");
  //     return false;
  //   }

  //   const spenderAddress =
  //     FUSION_CONTRACTS[chainId as keyof typeof FUSION_CONTRACTS];
  //   if (!spenderAddress) {
  //     toast.error("Fusion contract not found for this chain");
  //     return false;
  //   }

  //   try {
  //     setIsCheckingApproval(true);

  //     const provider = new ethers.BrowserProvider(primaryWallet.walletClient);
  //     const signer = await provider.getSigner();
  //     const tokenContract = new ethers.Contract(
  //       tokenAddress,
  //       ERC20_ABI,
  //       signer
  //     );

  //     const userAddress = await signer.getAddress();
  //     const allowance = await tokenContract.allowance(
  //       userAddress,
  //       spenderAddress
  //     );

  //     // For USD investments, we need to convert to token amount
  //     // Since we're investing USD, we'll use a reasonable amount for approval
  //     const approvalAmount = ethers.parseUnits("1000000", 18); // 1M tokens

  //     const isApproved = allowance >= approvalAmount;

  //     // Store approval status
  //     const approvalKey = `${tokenAddress}-${chainId}`;
  //     setApprovalStatus((prev) => ({
  //       ...prev,
  //       [approvalKey]: isApproved,
  //     }));

  //     return isApproved;
  //   } catch (error) {
  //     console.error("Error checking token approval:", error);
  //     toast.error("Failed to check token approval");
  //     return false;
  //   } finally {
  //     setIsCheckingApproval(false);
  //   }
  // };

  // Request token approval
  // const requestTokenApproval = async (
  //   tokenAddress: string,
  //   chainId: number
  // ) => {
  //   if (!primaryWallet?.address || !primaryWallet?.provider) {
  //     toast.error("Wallet not connected");
  //     return false;
  //   }

  //   const spenderAddress =
  //     FUSION_CONTRACTS[chainId as keyof typeof FUSION_CONTRACTS];
  //   if (!spenderAddress) {
  //     toast.error("Fusion contract not found for this chain");
  //     return false;
  //   }

  //   try {
  //     setIsApproving(true);

  //     const provider = new ethers.BrowserProvider(primaryWallet.walletClient);
  //     const signer = await provider.getSigner();
  //     const tokenContract = new ethers.Contract(
  //       tokenAddress,
  //       ERC20_ABI,
  //       signer
  //     );

  //     // Get token info for better UX
  //     const [tokenSymbol, tokenName] = await Promise.all([
  //       tokenContract.symbol(),
  //       tokenAddress,
  //     ]);

  //     toast.loading(`Approving ${tokenSymbol} for automated investments...`);

  //     // Approve with maximum amount
  //     const approveTx = await tokenContract.approve(
  //       spenderAddress,
  //       ethers.MaxUint256
  //     );

  //     toast.loading("Waiting for approval confirmation...");
  //     await approveTx.wait();

  //     // Update approval status
  //     const approvalKey = `${tokenAddress}-${chainId}`;
  //     setApprovalStatus((prev) => ({
  //       ...prev,
  //       [approvalKey]: true,
  //     }));

  //     toast.success(`${tokenSymbol} approved successfully!`);

  //     // Store approval locally for faster UX
  //     localStorage.setItem(`approved-${tokenAddress}-${chainId}`, "true");

  //     // Also save to approvalStatus state
  //     const currentApprovalKey = `${tokenAddress}-${chainId}`;
  //     const newApprovalStatus = {
  //       ...approvalStatus,
  //       [currentApprovalKey]: true,
  //     };
  //     setApprovalStatus(newApprovalStatus);
  //     localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus));

  //     return true;
  //   } catch (error) {
  //     console.error("Error approving token:", error);
  //     toast.error("Failed to approve token");
  //     return false;
  //   } finally {
  //     setIsApproving(false);
  //   }
  // };

  // Check if approval is needed for current token
  // const isApprovalNeeded = () => {
  //   if (!formData.tokenAddress || !formData.sourceChain) return false;

  //   const approvalKey = `${formData.tokenAddress}-${formData.sourceChain}`;
  //   return !approvalStatus[approvalKey];
  // };

  // Fetch token info by address
  const fetchTokenInfo = async () => {
    if (!formData.tokenAddress) return;

    try {
      const response = await authenticatedFetch(
        `/api/tokens/search/${formData.tokenAddress}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setTokenSearchResult(data.token);
        toast.success(`Found token: ${data.token.name} (${data.token.symbol})`);
      } else {
        toast.error(data.error || "Token not found");
        setTokenSearchResult(null);
      }
    } catch (error) {
      console.error("Token search error:", error);
      toast.error("Failed to search token");
    }
  };

  // Form validation
  const isFormValid = () => {
    if (!address) return false;
    if (!formData.jarName.trim()) return false;
    if (!formData.amount || parseFloat(formData.amount) <= 0) return false;
    if (!formData.startDate) return false;
    if (!formData.tokenAddress || !tokenSearchResult) return false;

    if (
      formData.frequency === "custom" &&
      (!formData.customDays || parseInt(formData.customDays) <= 0)
    ) {
      return false;
    }

    return true;
  };

  // Check if form is ready for submission (approval will be handled during authorization)
  const isFormReadyForSubmission = () => {
    return isFormValid();
  };

  // Get selected token info for display
  // const getSelectedTokenInfo = () => {
  //   if (tokenSearchResult) {
  //     return `${tokenSearchResult.name} (${tokenSearchResult.symbol})`;
  //   }
  //   return "No token selected";
  // };

  // Get token symbol for amount display
  const getTokenSymbol = () => {
    if (tokenSearchResult) {
      return tokenSearchResult.symbol;
    }
    return "TOKEN";
  };

  // Get target token symbol for display
  const getTargetTokenSymbol = () => {
    if (tokenSearchResult) {
      return tokenSearchResult.symbol;
    }
    return "TARGET";
  };

  // Consistent date formatting to avoid hydration mismatch
  const formatDateConsistent = (dateString: string) => {
    if (!dateString) return "Not set";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${month}/${day}/${year}`;
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log("🚀 Launch Jar button clicked!");
    console.log("Form data:", formData);
    console.log("Address:", address);
    console.log("Form valid:", isFormValid());

    if (!isFormValid()) {
      console.error("❌ Form validation failed");
      toast.error("Please fill in all required fields");
      return;
    }

    if (!address) {
      console.error("❌ No wallet address");
      toast.error("Please connect your wallet first");
      return;
    }

    console.log("✅ Opening confirmation modal...");
    console.log("Modal open state before:", isModalOpen);

    // For now, just open the modal for confirmation
    openModal();

    // Check if modal state changed
    setTimeout(() => {
      console.log("Modal open state after:", isModalOpen);
    }, 100);
  };

  // Final submission after modal confirmation
  const confirmAndSubmit = async () => {
    console.log("🔥 Confirming and submitting investment...");

    // If we don't have jar authorization yet, show the final authorization
    if (!jarAuthorized) {
      setShowFinalAuthorization(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for the API
      const apiData: CreateInvestmentFormData = {
        sourceToken: formData.tokenAddress,
        sourceChain: formData.sourceChain,
        targetToken: formData.tokenAddress,
        targetChain: formData.targetChain,
        amount: parseFloat(formData.amount),
        amountUnit: getTokenSymbol(),
        frequency: formData.frequency.toLowerCase() as
          | "daily"
          | "weekly"
          | "monthly"
          | "custom",
        customDays:
          formData.frequency === "custom"
            ? parseInt(formData.customDays)
            : undefined,
        startDate: formData.startDate,
        jarName: formData.jarName,
        saveAsTemplate: formData.saveAsTemplate,
        gasLimit: formData.gasLimit || undefined,
        minSlippage: formData.minSlippage
          ? parseFloat(formData.minSlippage)
          : undefined,
        deadline: formData.deadline ? parseInt(formData.deadline) : undefined,
        stopAfterSwaps: formData.stopSwaps
          ? parseInt(formData.stopSwaps)
          : undefined,
        // Store wallet address and jar data for automatic execution
        walletAddress: primaryWallet?.address || address,
      };

      console.log("📡 Debug - Addresses being used:");
      console.log("  - primaryWallet?.address:", primaryWallet?.address);
      console.log("  - address:", address);
      console.log(
        "  - final walletAddress:",
        primaryWallet?.address || address
      );
      console.log("📡 Submitting to API with jar data:", apiData);
      console.log("🌐 Making request to /api/investments/create");

      const response = await authenticatedFetch("/api/investments/create", {
        method: "POST",
        body: JSON.stringify(apiData),
      });

      console.log("📨 API Response status:", response.status);
      const result = await response.json();
      console.log("📊 API Response data:", result);

      if (response.ok) {
        console.log("✅ Investment created successfully!");
        toast.success("Investment jar created successfully! 🎉");

        // Reset form
        setFormData({
          sourceChain: 1,
          targetChain: 137,
          sourceToken: "",
          targetToken: "",
          amount: "",
          tokenAddress: "",
          frequency: "weekly",
          customDays: "",
          startDate: new Date().toISOString().split("T")[0],
          jarName: "",
          saveAsTemplate: false,
          gasLimit: "",
          minSlippage: "0.5",
          deadline: "20",
          stopSwaps: "",
        });

        setTokenSearchResult(null);
        closeModal();

        // Optionally redirect to portfolio
        // router.push("/portfolio");
      } else {
        console.error("❌ API Error:", result);
        toast.error(result.error || "Failed to create investment jar");
      }
    } catch (error) {
      console.error("💥 Submit error:", error);
      toast.error("Failed to create investment jar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-6 py-16 flex-grow">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-lg shadow-black/20">
              <h3 className="text-lg font-bold font-heading mb-4 text-[var(--on-surface-strong)]">
                1. Select Token
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <label
                    className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                    htmlFor="token-search"
                  >
                    Search token
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        ></path>
                      </svg>
                    </span>
                    <input
                      className="input-base pl-11 pr-4"
                      id="token-search"
                      placeholder="Search by name or paste address"
                      type="search"
                      value={formData.tokenAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tokenAddress: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="btn-primary text-sm px-4 py-2"
                      onClick={fetchTokenInfo}
                      disabled={!formData.tokenAddress}
                    >
                      Search Token
                    </button>
                    {tokenSearchResult && (
                      <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        {tokenSearchResult.symbol} Found
                      </div>
                    )}
                  </div>
                </div>
                {tokenSearchResult && (
                  <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border-color)]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {tokenSearchResult.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--on-surface-strong)]">
                          {tokenSearchResult.name}
                        </p>
                        <p className="text-sm text-[var(--on-surface)]">
                          {tokenSearchResult.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tokenSearchResult.chainCompatibility.map((chain) => (
                        <span
                          key={chain.chainId}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            chain.supported
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {chain.chainName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-lg shadow-black/20">
              <h3 className="text-lg font-bold font-heading mb-4 text-[var(--on-surface-strong)]">
                2. Recurring Investment Plan
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="amount"
                    >
                      Amount to Invest
                    </label>
                    <div className="relative">
                      <input
                        className="input-base pr-16"
                        id="amount"
                        placeholder="100.00"
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="text-[var(--on-surface-strong)] font-medium sm:text-sm">
                          USD
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="frequency"
                    >
                      Frequency
                    </label>
                    <select
                      className="input-base select-base"
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          frequency: e.target.value,
                        }))
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                {formData.frequency === "custom" && (
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="custom-days"
                    >
                      Custom Days
                    </label>
                    <input
                      className="input-base"
                      id="custom-days"
                      placeholder="e.g. 10"
                      type="number"
                      value={formData.customDays}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customDays: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div>
                  <label
                    className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                    htmlFor="start-date"
                  >
                    Start Date
                  </label>
                  <input
                    className="input-base"
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <details className="group pt-2" id="advanced-settings">
                  <summary className="flex items-center justify-between cursor-pointer text-[var(--on-surface)] hover:text-white">
                    <span className="font-medium text-sm">
                      Advanced Settings
                    </span>
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </summary>
                  <div className="mt-4 space-y-4 pt-4 border-t border-[var(--border-color)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                          htmlFor="min-slippage"
                        >
                          Slippage Tolerance
                        </label>
                        <input
                          className="input-base"
                          id="min-slippage"
                          placeholder="0.5%"
                          type="number"
                          value={formData.minSlippage}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              minSlippage: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                          htmlFor="stop-swaps"
                        >
                          Max Investment Cap
                        </label>
                        <input
                          className="input-base"
                          id="stop-swaps"
                          placeholder="e.g. 10,000 USDC"
                          type="text"
                          value={formData.stopSwaps}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              stopSwaps: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-lg shadow-black/20 sticky top-28 self-start">
              <h3 className="text-lg font-bold font-heading text-[var(--on-surface-strong)] mb-4">
                Live Preview
              </h3>
              <div className="border border-[var(--border-color)] rounded-2xl p-4 space-y-3 bg-[var(--background)] shadow-inner">
                <div className="pb-3 border-b border-[var(--border-color)]">
                  <p className="text-sm text-[var(--on-surface)] mb-2">
                    Jar Name
                  </p>
                  <input
                    className="w-full bg-[var(--surface)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface-strong)] placeholder:text-[var(--on-surface)] focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all duration-300"
                    placeholder="Enter jar name..."
                    value={formData.jarName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        jarName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[var(--on-surface)] text-sm">Token</p>
                  <div className="flex items-center gap-2">
                    {tokenSearchResult ? (
                      <>
                        <div className="w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {tokenSearchResult.symbol.slice(0, 2)}
                        </div>
                        <p className="text-[var(--on-surface-strong)] font-medium">
                          {tokenSearchResult.symbol}
                        </p>
                      </>
                    ) : (
                      <p className="text-[var(--on-surface)] text-sm">
                        Select token
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[var(--on-surface)] text-sm">Amount</p>
                  <p className="text-[var(--on-surface-strong)] font-medium">
                    ${formData.amount || "0"} USD
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[var(--on-surface)] text-sm">Frequency</p>
                  <p className="text-[var(--on-surface-strong)] font-medium">
                    {formData.frequency === "custom"
                      ? `Every ${formData.customDays || "?"} days`
                      : formData.frequency}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[var(--on-surface)] text-sm">Start Date</p>
                  <p className="text-[var(--on-surface-strong)] font-medium">
                    {formData.startDate
                      ? formatDateConsistent(formData.startDate)
                      : "Not set"}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--border-color)]"></div>
                <div className="flex justify-between items-center">
                  <p className="text-[var(--on-surface)] text-sm">Fee</p>
                  <p className="font-medium flex items-center gap-1 text-[var(--success)] text-sm">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                        fillRule="evenodd"
                      ></path>
                    </svg>
                    Gasless
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  className="w-full btn-primary flex items-center justify-center gap-2 text-base"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isFormReadyForSubmission()}
                >
                  <span>{isSubmitting ? "Creating..." : "Launch Jar"}</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </button>
                <p className="text-xs text-center mt-3 text-[var(--on-surface)]">
                  You will be asked for one signature to launch the Jar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[100] ${
          isModalOpen ? "block" : "hidden"
        } p-4`}
      >
        {showFinalAuthorization ? (
          (() => {
            const jarData = {
              jarName: formData.jarName || "Unnamed Jar",
              amount: parseFloat(formData.amount) || 0, // Amount in USD
              frequency:
                formData.frequency === "custom"
                  ? `Every ${formData.customDays || "?"} days`
                  : formData.frequency,
              startDate: formatDateConsistent(formData.startDate),
              walletAddress: primaryWallet?.address || address || "",
              tokenSymbol: getTokenSymbol(), // Token being purchased (e.g., SPX)
              sourceChain: formData.sourceChain,
              targetChain: formData.targetChain,
              minSlippage: parseFloat(formData.minSlippage) || 0.5,
              tokenAddress: formData.tokenAddress, // Add token address for approval
            };
            console.log(
              "🔍 Debug - Data being passed to FinalAuthorization:",
              jarData
            );
            console.log(
              "🔍 Debug - formData.tokenAddress:",
              formData.tokenAddress
            );
            console.log(
              "🔍 Debug - formData.sourceChain:",
              formData.sourceChain
            );
            console.log("🔍 Debug - primaryWallet:", primaryWallet);
            return (
              <FinalAuthorization
                jarData={jarData}
                onAuthorize={handleJarAuthorized}
                onCancel={handleJarCancel}
              />
            );
          })()
        ) : (
          <div
            className={`bg-[var(--surface)] rounded-3xl shadow-2xl shadow-[var(--primary)]/20 w-full max-w-md m-4 transform transition-all duration-300 ${
              isModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-[var(--on-surface-strong)]">
                  Confirm Your Jar
                </h3>
                <button
                  className="p-1 rounded-full text-[var(--on-surface)] hover:bg-[var(--background)]"
                  onClick={closeModal}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                </button>
              </div>
              <p className="text-[var(--on-surface)] mt-2">
                Please review and sign to launch your recurring swap.
              </p>
              <div className="mt-8 space-y-5 border-t border-b border-[var(--border-color)] py-6">
                <div className="flex justify-between items-center text-sm">
                  <p className="text-[var(--on-surface)]">Jar Name</p>
                  <p className="text-[var(--on-surface-strong)] font-medium">
                    {formData.jarName || "Unnamed Jar"}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-[var(--on-surface)]">Investment</p>
                  <p className="text-[var(--on-surface-strong)] font-medium">
                    ${formData.amount || "0"} USD → {getTokenSymbol()}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-[var(--on-surface)]">Frequency</p>
                  <p className="text-[var(--on-surface-strong)] font-medium">
                    {formData.frequency === "custom"
                      ? `Every ${formData.customDays || "?"} days`
                      : formData.frequency}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-[var(--on-surface)]">Execution Window</p>
                  <p className="text-[var(--on-surface-strong)] font-medium">
                    ~ 15 Mins
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-[var(--on-surface)]">Est. Gas Fees</p>
                  <p className="font-medium flex items-center gap-1 text-[var(--success)]">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        fillRule="evenodd"
                      ></path>
                    </svg>
                    Gasless
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <button
                  className="w-full btn-primary flex items-center justify-center gap-2"
                  onClick={confirmAndSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating Investment..."
                    : jarAuthorized
                    ? "Create Investment Jar"
                    : "Review & Create Jar"}
                </button>
                <p className="text-xs text-center mt-4 text-[var(--on-surface)]">
                  {jarAuthorized
                    ? "Jar is authorized. Click to create the investment jar."
                    : "Review your jar details and authorize creation."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
