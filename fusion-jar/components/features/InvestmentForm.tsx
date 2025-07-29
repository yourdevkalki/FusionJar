"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { CreateInvestmentFormData } from "@/types/investment";
import { SUPPORTED_CHAINS, TOKENS, getTokensByChain } from "@/lib/tokens";
import { DollarSign, Calendar, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface InvestmentFormProps {
  onSuccess?: () => void;
}

export default function InvestmentForm({ onSuccess }: InvestmentFormProps) {
  const { address, authenticatedFetch } = useAuth();

  const [formData, setFormData] = useState<CreateInvestmentFormData>({
    sourceToken: "",
    sourceChain: 1,
    targetToken: "",
    targetChain: 1,
    amountUsd: 5,
    frequency: "weekly",
    feeTolerance: 0.5,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quote, setQuote] = useState<unknown>(null);
  const [showQuote, setShowQuote] = useState(false);

  const sourceTokens = getTokensByChain(formData.sourceChain);
  const targetTokens = getTokensByChain(formData.targetChain);

  const handleChainChange = (
    field: "sourceChain" | "targetChain",
    chainId: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: chainId,
      [field === "sourceChain" ? "sourceToken" : "targetToken"]: "",
    }));
    setQuote(null);
    setShowQuote(false);
  };

  const handleTokenChange = (
    field: "sourceToken" | "targetToken",
    tokenAddress: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: tokenAddress,
    }));
    setQuote(null);
    setShowQuote(false);
  };

  const getQuote = async () => {
    if (!formData.sourceToken || !formData.targetToken || !address) return;

    try {
      const response = await authenticatedFetch("/api/investments/quote", {
        method: "POST",
        body: JSON.stringify({
          src: formData.sourceToken,
          dst: formData.targetToken,
          amount: (formData.amountUsd * 1e6).toString(),
          from: address,
          chainId: formData.sourceChain,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuote(data);
        setShowQuote(true);
      }
    } catch (error) {
      console.error("Quote error:", error);
      toast.error("Failed to get quote");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.sourceToken || !formData.targetToken) {
      toast.error("Please select source and target tokens");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authenticatedFetch("/api/investments/create", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Investment intent created successfully!");
        setFormData({
          sourceToken: "",
          sourceChain: 1,
          targetToken: "",
          targetChain: 1,
          amountUsd: 5,
          frequency: "weekly",
          feeTolerance: 0.5,
        });
        setQuote(null);
        setShowQuote(false);
        onSuccess?.();
      } else {
        toast.error(data.error || "Failed to create investment");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to create investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTokenDisplay = (tokenAddress: string, chainId: number) => {
    const token = TOKENS.find(
      (t) => t.address === tokenAddress && t.chainId === chainId
    );
    return token ? `${token.symbol} (${token.name})` : "Select token";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Chain & Token */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Source</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chain
              </label>
              <select
                value={formData.sourceChain}
                onChange={(e) =>
                  handleChainChange("sourceChain", Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_CHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token
              </label>
              <select
                value={formData.sourceToken}
                onChange={(e) =>
                  handleTokenChange("sourceToken", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select token</option>
                {sourceTokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol} ({token.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Target Chain & Token */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Target</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chain
              </label>
              <select
                value={formData.targetChain}
                onChange={(e) =>
                  handleChainChange("targetChain", Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_CHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token
              </label>
              <select
                value={formData.targetToken}
                onChange={(e) =>
                  handleTokenChange("targetToken", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select token</option>
                {targetTokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol} ({token.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Investment Amount */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Investment Amount
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={formData.amountUsd}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amountUsd: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount ($1-$10)"
              />
              <div className="absolute right-3 top-2 text-gray-400">USD</div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Range: $1 - $10</p>
          </div>
        </div>

        {/* Frequency */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Frequency
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={formData.frequency === "daily"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: e.target.value as "daily" | "weekly",
                  }))
                }
                className="mr-3"
              />
              <div>
                <div className="font-medium">Daily</div>
                <div className="text-sm text-gray-500">
                  Every day at 9 AM UTC
                </div>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={formData.frequency === "weekly"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: e.target.value as "daily" | "weekly",
                  }))
                }
                className="mr-3"
              />
              <div>
                <div className="font-medium">Weekly</div>
                <div className="text-sm text-gray-500">
                  Every Monday at 9 AM UTC
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Fee Tolerance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Fee Tolerance
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum fee: {formData.feeTolerance}%
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={formData.feeTolerance}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  feeTolerance: Number(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>0.1%</span>
              <span>2%</span>
            </div>
          </div>
        </div>

        {/* Quote Preview */}
        {formData.sourceToken && formData.targetToken && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={getQuote}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Get Quote Preview
            </button>

            {showQuote && quote && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Quote Preview
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>You pay:</span>
                    <span>
                      ${formData.amountUsd}{" "}
                      {
                        getTokenDisplay(
                          formData.sourceToken,
                          formData.sourceChain
                        ).split(" ")[0]
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>You receive:</span>
                    <span>
                      ~${(formData.amountUsd * 0.995).toFixed(2)}{" "}
                      {
                        getTokenDisplay(
                          formData.targetToken,
                          formData.targetChain
                        ).split(" ")[0]
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Estimated fee:</span>
                    <span>~${(formData.amountUsd * 0.005).toFixed(3)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isSubmitting || !formData.sourceToken || !formData.targetToken
          }
          className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Investment..." : "Create Investment Intent"}
        </button>
      </form>
    </div>
  );
}
