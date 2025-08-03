"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { HistoryData, InvestmentExecution } from "@/types/investment";
import { SUPPORTED_CHAINS } from "@/lib/tokens";

export function HistoryPage() {
  const { address } = useAuth();
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    if (address) {
      fetchHistory();
    }
  }, [address, selectedChain, selectedStatus]);

  const fetchHistory = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedChain) {
        queryParams.append("chainId", selectedChain.toString());
      }
      if (selectedStatus !== "all") {
        queryParams.append("status", selectedStatus);
      }
      
      const response = await fetch(`/api/history/${address}?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setHistoryData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch investment execution history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChainName = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  const formatUSDAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short"
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "fulfilled":
        return {
          text: "Fulfilled",
          style: "bg-[var(--success)]/10 text-[var(--success)]"
        };
      case "pending":
        return {
          text: "Pending",
          style: "bg-yellow-500/10 text-yellow-500"
        };
      case "failed":
        return {
          text: "Failed",
          style: "bg-red-500/10 text-red-500"
        };
      case "skipped":
        return {
          text: "Skipped",
          style: "bg-gray-500/10 text-gray-500"
        };
      default:
        return {
          text: status,
          style: "bg-gray-500/10 text-gray-500"
        };
    }
  };

  const getTokenSymbol = (tokenAddress: string) => {
    // Common token symbols mapping
    const tokenSymbols: Record<string, string> = {
      "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
      "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C": "USDC",
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
      "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": "UNI",
      "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0": "MATIC",
    };
    return tokenSymbols[tokenAddress] || "Unknown";
  };
  return (
    <div className="min-h-screen bg-background">
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Investment History
            </h1>
            <div className="flex items-center gap-4">
              <select 
                className="rounded-md bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="skipped">Skipped</option>
              </select>
              
              <select 
                className="rounded-md bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                value={selectedChain || ""}
                onChange={(e) => setSelectedChain(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">All Chains</option>
                {SUPPORTED_CHAINS.map(chain => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
              
              <button
                onClick={fetchHistory}
                className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/80"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-lg bg-[var(--surface)] shadow-md">
                  <table className="min-w-full divide-y divide-[var(--stroke)]">
                    <thead className="bg-black/20">
                      <tr>
                        <th
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6"
                          scope="col"
                        >
                          Executed At
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          Investment
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          From → To
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          Fee Paid
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          Status
                        </th>
                        <th
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                          scope="col"
                        >
                          <span className="sr-only">TX Link</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--stroke)] bg-[var(--surface)]">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
                            <p className="mt-2 text-[var(--text-secondary)]">Loading investment execution history...</p>
                          </td>
                        </tr>
                      ) : !address ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-[var(--text-secondary)]">
                            Please connect your wallet to view investment execution history
                          </td>
                        </tr>
                      ) : !historyData?.executions || historyData.executions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-[var(--text-secondary)]">
                            No investment executions found
                          </td>
                        </tr>
                      ) : (
                        historyData.executions.map((execution, index) => {
                          const statusInfo = getStatusDisplay(execution.status);
                          return (
                            <tr key={execution.id || index}>
                              <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-[var(--text-secondary)] sm:pl-6">
                                {execution.executed_at 
                                  ? formatTimestamp(execution.executed_at)
                                  : formatTimestamp(execution.created_at)
                                }
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                                {formatUSDAmount(execution.amount_usd)}
                                {execution.actual_amount_in && execution.actual_amount_out && (
                                  <div className="text-xs text-[var(--text-secondary)]">
                                    {execution.actual_amount_in} → {execution.actual_amount_out}
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--text-secondary)]">
                                <div className="space-y-1">
                                  <div>
                                    {getChainName(execution.source_chain)} → {getChainName(execution.target_chain)}
                                  </div>
                                  <div className="text-xs">
                                    {getTokenSymbol(execution.source_token)} → {getTokenSymbol(execution.target_token)}
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--text-secondary)]">
                                {execution.fee_paid ? `$${parseFloat(execution.fee_paid).toFixed(4)}` : "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.style}`}>
                                  <svg
                                    className="mr-1.5 h-2 w-2"
                                    fill="currentColor"
                                    viewBox="0 0 8 8"
                                  >
                                    <circle cx="4" cy="4" r="3"></circle>
                                  </svg>
                                  {statusInfo.text}
                                </span>
                              </td>
                              <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                {execution.transaction_hash ? (
                                  <a
                                    className="flex items-center justify-end gap-1 text-[var(--primary)] transition-colors hover:text-[var(--primary)]/80"
                                    href={`https://etherscan.io/tx/${execution.transaction_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View TX{" "}
                                    <span className="material-icons text-base">
                                      open_in_new
                                    </span>
                                  </a>
                                ) : (
                                  <span className="text-[var(--text-secondary)]">No TX</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
