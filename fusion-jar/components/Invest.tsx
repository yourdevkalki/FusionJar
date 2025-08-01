"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { SUPPORTED_CHAINS, TOKENS, getTokensByChain } from "@/lib/tokens";
import { CreateInvestmentFormData, TokenSearchResult } from "@/types/investment";

export default function Invest() {
  const { address, authenticatedFetch } = useAuth();
  
  const [activeTab, setActiveTab] = useState("select-token");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenSearchResult, setTokenSearchResult] = useState<TokenSearchResult | null>(null);
  const [quote, setQuote] = useState<any>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    sourceChain: 1,
    targetChain: 137,
    sourceToken: "",
    targetToken: "",
    amount: "",
    tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    frequency: "weekly",
    customDays: "",
    startDate: new Date().toISOString().split('T')[0],
    jarName: "",
    saveAsTemplate: false,
    gasLimit: "",
    minSlippage: "0.5",
    deadline: "20",
    stopSwaps: ""
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch token info by address
  const fetchTokenInfo = async () => {
    if (!formData.tokenAddress) return;

    try {
      const response = await authenticatedFetch(`/api/tokens/search/${formData.tokenAddress}`);
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
    
    if (activeTab === "select-token") {
      if (!formData.sourceToken || !formData.targetToken) return false;
    } else {
      if (!formData.tokenAddress || !tokenSearchResult) return false;
    }
    
    if (formData.frequency === "custom" && (!formData.customDays || parseInt(formData.customDays) <= 0)) {
      return false;
    }
    
    return true;
  };

  // Get selected token info for display
  const getSelectedTokenInfo = () => {
    if (activeTab === "select-token" && formData.sourceToken) {
      const token = getTokensByChain(formData.sourceChain).find(t => t.address === formData.sourceToken);
      return token ? `${token.name} (${token.symbol})` : "Selected Token";
    } else if (activeTab === "search-token" && tokenSearchResult) {
      return `${tokenSearchResult.name} (${tokenSearchResult.symbol})`;
    }
    return "No token selected";
  };

  // Get token symbol for amount display
  const getTokenSymbol = () => {
    if (activeTab === "select-token" && formData.sourceToken) {
      const token = getTokensByChain(formData.sourceChain).find(t => t.address === formData.sourceToken);
      return token?.symbol || "TOKEN";
    } else if (activeTab === "search-token" && tokenSearchResult) {
      return tokenSearchResult.symbol;
    }
    return "TOKEN";
  };

  // Get target token symbol for display
  const getTargetTokenSymbol = () => {
    if (activeTab === "select-token" && formData.targetToken) {
      const token = getTokensByChain(formData.targetChain).find(t => t.address === formData.targetToken);
      return token?.symbol || "TARGET";
    } else if (activeTab === "search-token" && tokenSearchResult) {
      return tokenSearchResult.symbol;
    }
    return "TARGET";
  };

  // Consistent date formatting to avoid hydration mismatch
  const formatDateConsistent = (dateString: string) => {
    if (!dateString) return "Not set";
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
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
    setIsSubmitting(true);
    
    try {
      // Prepare the data for the API
      const apiData: CreateInvestmentFormData = {
        sourceToken: activeTab === "select-token" ? formData.sourceToken : formData.tokenAddress,
        sourceChain: formData.sourceChain,
        targetToken: activeTab === "select-token" ? formData.targetToken : formData.tokenAddress,
        targetChain: formData.targetChain,
        amount: parseFloat(formData.amount),
        amountUnit: getTokenSymbol(),
        frequency: formData.frequency.toLowerCase() as "daily" | "weekly" | "monthly" | "custom",
        customDays: formData.frequency === "custom" ? parseInt(formData.customDays) : undefined,
        startDate: formData.startDate,
        jarName: formData.jarName,
        saveAsTemplate: formData.saveAsTemplate,
        gasLimit: formData.gasLimit || undefined,
        minSlippage: formData.minSlippage ? parseFloat(formData.minSlippage) : undefined,
        deadline: formData.deadline ? parseInt(formData.deadline) : undefined,
        stopAfterSwaps: formData.stopSwaps ? parseInt(formData.stopSwaps) : undefined,
      };

      console.log("📡 Submitting to API:", apiData);
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
          tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          frequency: "weekly",
          customDays: "",
          startDate: new Date().toISOString().split('T')[0],
          jarName: "",
          saveAsTemplate: false,
          gasLimit: "",
          minSlippage: "0.5",
          deadline: "20",
          stopSwaps: ""
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
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-bold text-[var(--on-surface-strong)]">
                Create Jar
              </h2>
              <p className="text-[var(--on-surface)] mt-2">
                Set up a recurring cross-chain investment intent (Fusion+
                intent).
              </p>
            </div>
            <div className="space-y-8">
              <div>
                <div className="border-b border-[var(--border-color)] mb-6">
                  <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                    <button
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "select-token"
                          ? "tab-active"
                          : "tab-inactive"
                      }`}
                      onClick={() => setActiveTab("select-token")}
                    >
                      Select Token
                    </button>
                    <button
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "search-token"
                          ? "tab-active"
                          : "tab-inactive"
                      }`}
                      onClick={() => setActiveTab("search-token")}
                    >
                      Search by Token Address
                    </button>
                  </nav>
                </div>
                <div
                  className={`space-y-6 ${
                    activeTab === "select-token" ? "" : "hidden"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                        htmlFor="source-chain"
                      >
                        Source Chain
                      </label>
                      <select
                        className="input-base select-base"
                        id="source-chain"
                        value={formData.sourceChain}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          sourceChain: Number(e.target.value),
                          sourceToken: ""
                        }))}
                      >
                        {SUPPORTED_CHAINS.map(chain => (
                          <option key={chain.id} value={chain.id}>{chain.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                        htmlFor="destination-chain"
                      >
                        Destination Chain
                      </label>
                      <select
                        className="input-base select-base"
                        id="destination-chain"
                        value={formData.targetChain}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          targetChain: Number(e.target.value),
                          targetToken: ""
                        }))}
                      >
                        {SUPPORTED_CHAINS.map(chain => (
                          <option key={chain.id} value={chain.id}>{chain.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="select-token-input"
                    >
                      Token
                    </label>
                    <select
                      className="input-base select-base"
                      id="select-token-input"
                      value={formData.sourceToken}
                      onChange={(e) => setFormData(prev => ({...prev, sourceToken: e.target.value}))}
                    >
                      <option value="">Select Source Token</option>
                      {getTokensByChain(formData.sourceChain).map(token => (
                        <option key={`source-token-${token.address}`} value={token.address}>
                          {token.symbol} ({token.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="select-target-token"
                    >
                      Target Token
                    </label>
                    <select
                      className="input-base select-base"
                      id="select-target-token"
                      value={formData.targetToken}
                      onChange={(e) => setFormData(prev => ({...prev, targetToken: e.target.value}))}
                    >
                      <option value="">Select Target Token</option>
                      {getTokensByChain(formData.targetChain).map(token => (
                        <option key={`target-token-${token.address}`} value={token.address}>
                          {token.symbol} ({token.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  className={`${
                    activeTab === "search-token" ? "" : "hidden"
                  } space-y-6`}
                >
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="token-address"
                    >
                      Token Address
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-grow">
                        <input
                          className="input-base peer"
                          id="token-address"
                          placeholder="0x..."
                          type="text"
                          value={formData.tokenAddress}
                          onChange={(e) => setFormData(prev => ({...prev, tokenAddress: e.target.value}))}
                        />
                        <p className="mt-2 text-xs text-[var(--success)] peer-invalid:hidden">
                          Valid Uniswap (UNI) Address
                        </p>
                        <p className="mt-2 text-xs text-red-500 hidden peer-invalid:block">
                          Invalid address format.
                        </p>
                      </div>
                      <button 
                        className="btn-primary text-sm px-4 py-2 self-center sm:self-auto"
                        onClick={fetchTokenInfo}
                        disabled={!formData.tokenAddress}
                      >
                        Fetch Token Info
                      </button>
                    </div>
                  </div>
                  <div className="bg-[var(--surface)] p-4 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-[var(--on-surface-strong)]">
                      Token Name:{" "}
                      <span className="font-normal text-[var(--on-surface)]">
                        Uniswap (UNI)
                      </span>
                    </p>
                    <p className="text-sm font-medium text-[var(--on-surface-strong)]">
                      Chain Compatibility:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ethereum
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Polygon
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Arbitrum
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--on-surface-strong)] mb-6">
                  Recurring Investment Plan
                </h3>
                <div className="space-y-6">
                  <div className="relative">
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="amount"
                    >
                      Amount to invest
                    </label>
                    <input
                      className="input-base pr-16"
                      id="amount"
                      placeholder="0.0"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                    />
                    <div className="absolute inset-y-0 right-0 top-7 flex items-center pr-3 pointer-events-none">
                      <span className="text-[var(--on-surface-strong)] sm:text-sm">
                        {getTokenSymbol()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                      htmlFor="frequency"
                    >
                      Interval
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        className="input-base select-base" 
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData(prev => ({...prev, frequency: e.target.value}))}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                      <div className="relative">
                        <input
                          className="input-base pr-20"
                          id="custom-days"
                          placeholder="e.g. 10"
                          type="number"
                          value={formData.customDays}
                          onChange={(e) => setFormData(prev => ({...prev, customDays: e.target.value}))}
                          disabled={formData.frequency !== "custom"}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-[var(--on-surface)] sm:text-sm">
                            days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <details className="group" id="advanced-settings">
                    <summary className="flex items-center justify-between cursor-pointer text-[var(--on-surface)] hover:text-white">
                      <span className="font-medium">Advanced Settings</span>
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
                    <div className="mt-4 space-y-6 pt-4 border-t border-[var(--border-color)]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label
                            className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                            htmlFor="gas-limit"
                          >
                            Gas Limit Override
                          </label>
                          <input
                            className="input-base"
                            id="gas-limit"
                            placeholder="Auto"
                            type="text"
                            value={formData.gasLimit}
                            onChange={(e) => setFormData(prev => ({...prev, gasLimit: e.target.value}))}
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                            htmlFor="min-slippage"
                          >
                            Min. Slippage (%)
                          </label>
                          <input
                            className="input-base"
                            id="min-slippage"
                            placeholder="0.5"
                            type="number"
                            value={formData.minSlippage}
                            onChange={(e) => setFormData(prev => ({...prev, minSlippage: e.target.value}))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label
                            className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                            htmlFor="deadline"
                          >
                            Deadline (minutes)
                          </label>
                          <input
                            className="input-base"
                            id="deadline"
                            placeholder="20"
                            type="number"
                            value={formData.deadline}
                            onChange={(e) => setFormData(prev => ({...prev, deadline: e.target.value}))}
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                            htmlFor="stop-swaps"
                          >
                            Stop after N swaps
                          </label>
                          <input
                            className="input-base"
                            id="stop-swaps"
                            placeholder="Never"
                            type="text"
                            value={formData.stopSwaps}
                            onChange={(e) => setFormData(prev => ({...prev, stopSwaps: e.target.value}))}
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-2xl shadow-[var(--primary)]/10 space-y-8 sticky top-32 self-start">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-2xl font-bold text-[var(--on-surface-strong)]">
                Preview
              </h3>
              <div className="flex-grow sm:max-w-xs">
                <label
                  className="block text-sm font-medium text-[var(--on-surface)] mb-2"
                  htmlFor="jar-name"
                >
                  Jar Name
                </label>
                <input
                  className="input-base h-12"
                  id="jar-name"
                  placeholder="e.g. My Weekly UNI Jar"
                  type="text"
                  value={formData.jarName}
                  onChange={(e) => setFormData(prev => ({...prev, jarName: e.target.value}))}
                />
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">Token</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  {getSelectedTokenInfo()}
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">Amount</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  {formData.amount || "0"} {getTokenSymbol()}
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">Frequency</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  {formData.frequency === "custom" ? `Every ${formData.customDays || "?"} days` : formData.frequency}
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">Start Date</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  {formData.startDate ? formatDateConsistent(formData.startDate) : "Not set"}
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">From</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  {SUPPORTED_CHAINS.find(c => c.id === formData.sourceChain)?.name || "Chain"}
                </p>
              </div>
              <div className="border-t border-[var(--border-color)]"></div>
              <div className="flex justify-between items-center">
                <p className="text-[var(--on-surface)]">To</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  {SUPPORTED_CHAINS.find(c => c.id === formData.targetChain)?.name || "Chain"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label
                className="flex items-center gap-3 cursor-pointer"
                htmlFor="save-template"
              >
                <input
                  className="h-4 w-4 rounded bg-[var(--surface)] border-[var(--border-color)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  id="save-template"
                  type="checkbox"
                  checked={formData.saveAsTemplate}
                  onChange={(e) => setFormData(prev => ({...prev, saveAsTemplate: e.target.checked}))}
                />
                <span className="text-sm text-[var(--on-surface)]">
                  Save as Template
                </span>
              </label>
            </div>
            <button
              className="w-full btn-primary flex items-center justify-center gap-2"
              id="launch-jar-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
            >
              <span>{isSubmitting ? "Creating..." : "Launch Jar"}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--success)]/20 text-[var(--success)]">
                Gasless
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[100] ${
          isModalOpen ? "block" : "hidden"
        } p-4`}
      >
        <div className={`bg-[var(--surface)] rounded-3xl shadow-2xl shadow-[var(--primary)]/20 w-full max-w-md m-4 transform transition-all duration-300 ${
          isModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}>
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
                <p className="text-[var(--on-surface)]">Swap</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  {formData.amount || "0"} {getTokenSymbol()} → {getTargetTokenSymbol()}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-[var(--on-surface)]">Frequency</p>
                <p className="text-[var(--on-surface-strong)] font-medium">
                  {formData.frequency === "custom" ? `Every ${formData.customDays || "?"} days` : formData.frequency}
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
                {isSubmitting ? "Creating Investment..." : "Sign & Start Recurring Swap"}
              </button>
              <p className="text-xs text-center mt-4 text-[var(--on-surface)]">
                You'll be asked to sign a transaction in your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
