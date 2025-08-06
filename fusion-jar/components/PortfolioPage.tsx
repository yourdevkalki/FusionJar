"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SUPPORTED_CHAINS } from "@/lib/tokens";
import { toast } from "react-hot-toast";

interface PortfolioData {
  totalValue: number;
  totalValueUsd: number;
  totalInvestment: number;
  valueAcrossChains: number;
  dayChange: number;
  dayChangePercent: number;
  tokens: Array<{
    address: string;
    symbol: string;
    name: string;
    balance: string;
    balanceUsd: number;
    price: number;
    chainId: number;
  }>;
  chainTokens: Array<{
    address: string;
    symbol: string;
    name: string;
    balance: string;
    balanceUsd: number;
    price: number;
    chainId: number;
  }>;
  chartData: Array<{
    timestamp: number;
    value: number;
  }>;
}

interface InvestmentIntent {
  id: string;
  user_address: string;
  source_token: string;
  source_chain: number;
  target_token: string;
  target_chain: number;
  amount_usd: number;
  frequency: string;
  fee_tolerance: number;
  status: "active" | "paused" | "cancelled";
  created_at: string;
  updated_at: string;
  jar_name: string;
  amount: number;
  amount_unit: string;
  interval_days: number;
  start_date: string;
  save_as_template: boolean;
  gas_limit: string | null;
  min_slippage: number | null;
  deadline_minutes: number | null;
  stop_after_swaps: number | null;
}

export function PortfolioPage() {
  const { address, authenticatedFetch } = useAuth();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<{
    destroy: () => void;
  } | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null
  );
  const [investmentIntents, setInvestmentIntents] = useState<
    InvestmentIntent[]
  >([]);
  const [selectedChain] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [jarsLoading, setJarsLoading] = useState(true);
  const [expandedJars, setExpandedJars] = useState<Set<string>>(new Set());

  const fetchPortfolioData = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedChain) {
        queryParams.append("chainId", selectedChain.toString());
      }

      const response = await fetch(`/api/portfolio/${address}?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setPortfolioData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestmentIntents = async () => {
    if (!address) return;

    console.log("🔍 Debug - Fetching intents for address:", address);
    setJarsLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/investments/user/${address}`
      );
      const result = await response.json();

      console.log("🔍 Debug - API response:", result);

      if (result.success) {
        setInvestmentIntents(result.data);
        console.log("🔍 Debug - Set intents:", result.data);
      }
    } catch (error) {
      console.error("Failed to fetch investment intents:", error);
    } finally {
      setJarsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchPortfolioData();
      fetchInvestmentIntents();
    }
  }, [address, selectedChain, fetchPortfolioData, fetchInvestmentIntents]);

  useEffect(() => {
    if (chartRef.current && portfolioData?.chartData) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Import Chart.js dynamically
        import("chart.js/auto").then(({ Chart }) => {
          // Destroy existing chart if it exists
          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }

          // Create new chart and store reference
          chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: {
              labels: portfolioData.chartData.map((point) =>
                new Date(point.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              ),
              datasets: [
                {
                  label: "Portfolio Value",
                  data: portfolioData.chartData.map((point) => point.value),
                  borderColor: "#8b5cf6",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  borderWidth: 3,
                  pointBackgroundColor: "#8b5cf6",
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  tension: 0.4,
                  fill: true,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "rgba(22, 22, 26, 0.8)",
                  titleColor: "#ffffff",
                  bodyColor: "#8a8a94",
                  borderColor: "#2e2e48",
                  borderWidth: 1,
                  padding: 10,
                  callbacks: {
                    label: function (context: any) {
                      return `Value: $${context.parsed.y.toFixed(2)}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  grid: {
                    color: "#2e2e48",
                  },
                  ticks: {
                    color: "#8a8a94",
                    font: {
                      family: "'Inter', sans-serif",
                    },
                    callback: function (value: any) {
                      return "$" + value;
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: "#8a8a94",
                    font: {
                      family: "'Inter', sans-serif",
                    },
                  },
                },
              },
            },
          });
        });
      }
    }

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [portfolioData?.chartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // const formatPercent = (value: number) => {
  //   return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  // };

  const getChainName = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  const handleStatusUpdate = async (
    intentId: string,
    newStatus: "active" | "paused" | "cancelled"
  ) => {
    try {
      const response = await authenticatedFetch(
        "/api/investments/update-status",
        {
          method: "PATCH",
          body: JSON.stringify({
            intentId,
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`Jar ${newStatus} successfully`);
        // Refresh the investment intents
        fetchInvestmentIntents();
      } else {
        toast.error(result.error || "Failed to update jar status");
      }
    } catch (error) {
      console.error("Failed to update jar status:", error);
      toast.error("Failed to update jar status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "▶️";
      case "paused":
        return "⏸️";
      case "cancelled":
        return "⏹️";
      default:
        return "❓";
    }
  };

  const toggleJarExpansion = (jarId: string) => {
    setExpandedJars((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jarId)) {
        newSet.delete(jarId);
      } else {
        newSet.add(jarId);
      }
      return newSet;
    });
  };

  const isJarExpanded = (jarId: string) => expandedJars.has(jarId);

  return (
    <div className="min-h-screen bg-background">
      <main className="flex flex-1 justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          <div className="mb-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tighter text-white">
              Portfolio
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-medium text-gray-500">
                  Total Invested (Lifetime)
                </h3>
                <p className="text-4xl font-bold text-white">
                  {loading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    formatCurrency(portfolioData?.totalInvestment || 0)
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-medium text-gray-500">
                  Value Across Chains
                </h3>
                <p className="text-4xl font-bold text-white">
                  {loading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    formatCurrency(portfolioData?.valueAcrossChains || 0)
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-medium text-gray-500">
                  Total Performance
                </h3>
                <p
                  className={`text-4xl font-bold ${
                    loading
                      ? "text-gray-400"
                      : (portfolioData?.valueAcrossChains || 0) >=
                        (portfolioData?.totalInvestment || 0)
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {loading ? (
                    <span>Loading...</span>
                  ) : (
                    formatCurrency(
                      (portfolioData?.valueAcrossChains || 0) -
                        (portfolioData?.totalInvestment || 0)
                    )
                  )}
                </p>
                <p
                  className={`text-sm ${
                    loading
                      ? "text-gray-500"
                      : (portfolioData?.valueAcrossChains || 0) >=
                        (portfolioData?.totalInvestment || 0)
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {loading
                    ? ""
                    : portfolioData?.totalInvestment &&
                      portfolioData.totalInvestment > 0
                    ? `${(
                        ((portfolioData.valueAcrossChains -
                          portfolioData.totalInvestment) /
                          portfolioData.totalInvestment) *
                        100
                      ).toFixed(2)}%`
                    : "0.00%"}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-2 text-lg font-medium text-gray-500">
                  Active Jars
                </h3>
                <p className="text-4xl font-bold text-white">
                  {jarsLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    investmentIntents.filter(
                      (intent) => intent.status === "active"
                    ).length
                  )}
                </p>
              </div>
            </div>

            {/* Portfolio Growth Chart */}
            <div className="rounded-2xl bg-gray-800 p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    Portfolio Growth
                  </h3>
                  <p className="text-gray-500">
                    Past {portfolioData?.chartData?.length || 0} data points
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <span className="text-sm font-medium text-gray-500">
                    Current Value:{" "}
                    <span className="text-green font-bold">
                      {formatCurrency(portfolioData?.totalValueUsd || 0)}
                    </span>
                  </span>
                  <div className="flex gap-1 rounded-lg bg-gray-700 p-1">
                    <button className="px-3 py-1 text-sm font-medium rounded-md bg-purple text-white">
                      1Y
                    </button>
                    <button className="px-3 py-1 text-sm font-medium rounded-md text-gray-500 hover:bg-background">
                      6M
                    </button>
                    <button className="px-3 py-1 text-sm font-medium rounded-md text-gray-500 hover:bg-background">
                      1M
                    </button>
                    <button className="px-3 py-1 text-sm font-medium rounded-md text-gray-500 hover:bg-background">
                      7D
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>

            {/* Tokens Across Chains */}
            {portfolioData?.chainTokens &&
              portfolioData.chainTokens.length > 0 && (
                <div className="rounded-2xl bg-gray-800 p-6 shadow-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-white">
                        Tokens Across Chains
                      </h3>
                      <p className="text-gray-500">
                        Your holdings from investment executions
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">
                            Token
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">
                            Chain
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">
                            Balance
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">
                            Price
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">
                            Value (USD)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioData.chainTokens.map((token, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-700 transition-colors hover:bg-background"
                          >
                            <td className="px-4 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-mono text-white">
                                  {token.symbol?.slice(0, 2) || "T"}
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    {token.symbol}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {token.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                                {getChainName(token.chainId)}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-middle text-white">
                              {parseFloat(token.balance) > 0 ? (
                                <span>
                                  {parseFloat(token.balance).toFixed(6)}{" "}
                                  {token.symbol}
                                </span>
                              ) : (
                                <span className="text-gray-400">
                                  0 {token.symbol}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 align-middle text-white">
                              {formatCurrency(token.price)}
                            </td>
                            <td className="px-4 py-4 align-middle text-white font-semibold">
                              {formatCurrency(token.balanceUsd)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>

          {/* My Jars Table */}
          <div className="flex flex-col gap-4">
            <h2 className="px-2 text-2xl font-bold tracking-tight text-white">
              My Jars
            </h2>
            <div className="overflow-x-auto rounded-2xl bg-gray-800 shadow-lg">
              <table className="w-full text-left">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500 w-8">
                      {/* Expand/Collapse column */}
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-500">
                      Jar Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Investment Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Frequency
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Chain
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jarsLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-gray-400"
                      >
                        Loading your jars...
                      </td>
                    </tr>
                  ) : investmentIntents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-gray-400"
                      >
                        No investment jars found. Create your first jar!
                      </td>
                    </tr>
                  ) : (
                    investmentIntents.map((intent) => (
                      <React.Fragment key={intent.id}>
                        <tr className="border-b border-gray-700 transition-colors hover:bg-background">
                          <td className="px-6 py-4 align-middle">
                            <button
                              onClick={() => toggleJarExpansion(intent.id)}
                              className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
                            >
                              <svg
                                className={`w-4 h-4 text-white transition-transform duration-200 ${
                                  isJarExpanded(intent.id) ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-mono text-white">
                                {intent.jar_name?.slice(0, 2) || "J"}
                              </div>
                              <div>
                                <div className="font-medium text-white">
                                  {intent.jar_name || "Unnamed Jar"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Created {formatDate(intent.created_at)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle text-white">
                            {formatCurrency(intent.amount_usd)}
                          </td>
                          <td className="px-6 py-4 align-middle text-white">
                            {intent.frequency === "custom"
                              ? `Every ${intent.interval_days} days`
                              : intent.frequency.charAt(0).toUpperCase() +
                                intent.frequency.slice(1)}
                          </td>
                          <td className="px-6 py-4 align-middle text-white">
                            {formatDate(intent.start_date)}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                              {getChainName(intent.source_chain)}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                intent.status
                              )}`}
                            >
                              <span className="text-sm">
                                {getStatusIcon(intent.status)}
                              </span>
                              <span>
                                {intent.status.charAt(0).toUpperCase() +
                                  intent.status.slice(1)}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-2">
                              {intent.status === "active" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(intent.id, "paused")
                                    }
                                    className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                                  >
                                    <span>⏸️</span>
                                    <span>Pause</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(intent.id, "cancelled")
                                    }
                                    className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                                  >
                                    <span>⏹️</span>
                                    <span>Stop</span>
                                  </button>
                                </>
                              )}
                              {intent.status === "paused" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(intent.id, "active")
                                    }
                                    className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 hover:bg-green-500/30 transition-colors"
                                  >
                                    <span>▶️</span>
                                    <span>Resume</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(intent.id, "cancelled")
                                    }
                                    className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                                  >
                                    <span>⏹️</span>
                                    <span>Stop</span>
                                  </button>
                                </>
                              )}
                              {intent.status === "cancelled" && (
                                <span className="text-xs text-gray-500">
                                  No actions available
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {isJarExpanded(intent.id) && (
                          <tr
                            key={`${intent.id}-details`}
                            className="bg-gray-900/50"
                          >
                            <td colSpan={8} className="px-6 py-6">
                              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5 text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Jar Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* Basic Information */}
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                      Basic Information
                                    </h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Jar ID:
                                        </span>
                                        <span className="text-white font-mono text-sm">
                                          {intent.id.slice(0, 8)}...
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Created:
                                        </span>
                                        <span className="text-white">
                                          {formatDate(intent.created_at)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Last Updated:
                                        </span>
                                        <span className="text-white">
                                          {formatDate(intent.updated_at)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Save as Template:
                                        </span>
                                        <span
                                          className={`${
                                            intent.save_as_template
                                              ? "text-green-400"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          {intent.save_as_template
                                            ? "Yes"
                                            : "No"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Investment Details */}
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                      Investment Details
                                    </h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Amount:
                                        </span>
                                        <span className="text-white font-semibold">
                                          {formatCurrency(intent.amount_usd)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Amount Unit:
                                        </span>
                                        <span className="text-white">
                                          {intent.amount_unit}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Frequency:
                                        </span>
                                        <span className="text-white capitalize">
                                          {intent.frequency}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Interval Days:
                                        </span>
                                        <span className="text-white">
                                          {intent.interval_days} days
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Start Date:
                                        </span>
                                        <span className="text-white">
                                          {formatDate(intent.start_date)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Token & Chain Information */}
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                      Token & Chain
                                    </h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Source Token:
                                        </span>
                                        <span className="text-white font-mono text-sm">
                                          {intent.source_token.slice(0, 8)}...
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Target Token:
                                        </span>
                                        <span className="text-white font-mono text-sm">
                                          {intent.target_token.slice(0, 8)}...
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Source Chain:
                                        </span>
                                        <span className="text-white">
                                          {getChainName(intent.source_chain)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Target Chain:
                                        </span>
                                        <span className="text-white">
                                          {getChainName(intent.target_chain)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Advanced Settings */}
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                      Advanced Settings
                                    </h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Min Slippage:
                                        </span>
                                        <span className="text-white">
                                          {intent.min_slippage || "Not set"}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Fee Tolerance:
                                        </span>
                                        <span className="text-white">
                                          {intent.fee_tolerance}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Deadline:
                                        </span>
                                        <span className="text-white">
                                          {intent.deadline_minutes || "Not set"}{" "}
                                          min
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Gas Limit:
                                        </span>
                                        <span className="text-white">
                                          {intent.gas_limit || "Auto"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Stop After:
                                        </span>
                                        <span className="text-white">
                                          {intent.stop_after_swaps ||
                                            "No limit"}{" "}
                                          swaps
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Status Information */}
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                      Status
                                    </h5>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          Current Status:
                                        </span>
                                        <span
                                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                            intent.status
                                          )}`}
                                        >
                                          <span className="text-sm">
                                            {getStatusIcon(intent.status)}
                                          </span>
                                          <span>
                                            {intent.status
                                              .charAt(0)
                                              .toUpperCase() +
                                              intent.status.slice(1)}
                                          </span>
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          User Address:
                                        </span>
                                        <span className="text-white font-mono text-sm">
                                          {intent.user_address.slice(0, 6)}...
                                          {intent.user_address.slice(-4)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
