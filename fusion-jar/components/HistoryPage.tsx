"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { HistoryTransaction, HistoryData } from "@/types/investment";
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
  }, [address, selectedChain]);

  const fetchHistory = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedChain) {
        queryParams.append("chainId", selectedChain.toString());
      }
      
      const response = await fetch(`/api/history/${address}?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setHistoryData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChainName = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  const formatAmount = (amount?: string, decimals: number = 18, symbol: string = "") => {
    if (!amount || amount === "0") return "0";
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return `${value.toFixed(4)} ${symbol}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
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

  const getStatusDisplay = (status: "1" | "0") => {
    return status === "1" ? {
      text: "Executed",
      style: "bg-[var(--success)]/10 text-[var(--success)]"
    } : {
      text: "Failed", 
      style: "bg-red-500/10 text-red-500"
    };
  };

  const filteredTransactions = (historyData?.transactions || []).filter(tx => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "executed") return tx.status === "1";
    if (selectedStatus === "failed") return tx.status === "0";
    return true;
  });
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
                <option value="executed">Executed</option>
                <option value="failed">Failed</option>
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
                          Timestamp
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          Amount
                        </th>
                        <th
                          className="px-3 py-3.5 text-left text-sm font-semibold"
                          scope="col"
                        >
                          From → To Chain
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
                          <td colSpan={5} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
                            <p className="mt-2 text-[var(--text-secondary)]">Loading transaction history...</p>
                          </td>
                        </tr>
                      ) : !address ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">
                            Please connect your wallet to view transaction history
                          </td>
                        </tr>
                      ) : filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx, index) => {
                          const statusInfo = getStatusDisplay(tx.status);
                          return (
                            <tr key={tx.txHash || index}>
                              <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm text-[var(--text-secondary)] sm:pl-6">
                                {formatTimestamp(tx.timeStamp)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm font-medium">
                                {tx.srcToken && tx.srcAmount 
                                  ? formatAmount(tx.srcAmount, tx.srcToken.decimals, tx.srcToken.symbol)
                                  : formatAmount(tx.value, 18, "ETH")
                                }
                                {tx.dstToken && tx.dstAmount && (
                                  <div className="text-xs text-[var(--text-secondary)]">
                                    → {formatAmount(tx.dstAmount, tx.dstToken.decimals, tx.dstToken.symbol)}
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm text-[var(--text-secondary)]">
                                {getChainName(tx.chainId)}
                                {tx.srcToken && tx.dstToken && (
                                  <div className="text-xs">
                                    {tx.srcToken.symbol} → {tx.dstToken.symbol}
                                  </div>
                                )}
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
                                <a
                                  className="flex items-center justify-end gap-1 text-[var(--primary)] transition-colors hover:text-[var(--primary)]/80"
                                  href={`https://etherscan.io/tx/${tx.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View TX{" "}
                                  <span className="material-icons text-base">
                                    open_in_new
                                  </span>
                                </a>
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
