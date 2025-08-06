"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  PortfolioData,
  InvestmentIntent,
  InvestmentExecution,
} from "@/types/investment";
import { getTokenByAddress, getChainById } from "@/lib/tokens";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function PortfolioDashboard() {
  const { address, authenticatedFetch } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [intents, setIntents] = useState<InvestmentIntent[]>([]);
  const [executions, setExecutions] = useState<InvestmentExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolioData = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/investments/user/${address}`
      );
      const data = await response.json();

      if (response.ok) {
        setPortfolio(data.portfolio);
        setIntents(data.intents || []);
        setExecutions(data.executions || []);
      } else {
        toast.error(data.error || "Failed to fetch portfolio data");
      }
    } catch (error) {
      console.error("Portfolio fetch error:", error);
      toast.error("Failed to fetch portfolio data");
    } finally {
      setIsLoading(false);
    }
  }, [address, authenticatedFetch]);

  useEffect(() => {
    if (address) {
      fetchPortfolioData();
    }
  }, [fetchPortfolioData]);

  const getTokenDisplay = (tokenAddress: string, chainId: number) => {
    const token = getTokenByAddress(tokenAddress, chainId);
    return token ? token.symbol : "Unknown";
  };

  const getChainDisplay = (chainId: number) => {
    const chain = getChainById(chainId);
    return chain ? chain.name : "Unknown";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fulfilled":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "text-green bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-500 bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No portfolio data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-background p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Invested
              </p>
              <p className="text-2xl font-bold text-white">
                ${portfolio.total_invested_usd.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple" />
          </div>
        </div>

        <div className="bg-background p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Value</p>
              <p className="text-2xl font-bold text-white">
                ${portfolio.current_value_usd.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-background p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total ROI</p>
              <p
                className={`text-2xl font-bold ${
                  portfolio.total_roi_percentage >= 0
                    ? "text-green"
                    : "text-red-600"
                }`}
              >
                {portfolio.total_roi_percentage >= 0 ? "+" : ""}
                {portfolio.total_roi_percentage.toFixed(2)}%
              </p>
            </div>
            {portfolio.total_roi_percentage >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-background p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {portfolio.total_executions > 0
                  ? (
                      (portfolio.successful_executions /
                        portfolio.total_executions) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Active Investment Intents */}
      {intents.length > 0 && (
        <div className="bg-background rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-500">
            <h3 className="text-lg font-semibold text-white">
              Active Investment Intents
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strategy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {intents.map((intent) => (
                  <tr key={intent.id} className="hover:bg-background">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {getTokenDisplay(
                          intent.source_token,
                          intent.source_chain
                        )}{" "}
                        →{" "}
                        {getTokenDisplay(
                          intent.target_token,
                          intent.target_chain
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getChainDisplay(intent.source_chain)} →{" "}
                        {getChainDisplay(intent.target_chain)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ${intent.amount_usd}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {intent.frequency.charAt(0).toUpperCase() +
                        intent.frequency.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          intent.status
                        )}`}
                      >
                        {intent.status.charAt(0).toUpperCase() +
                          intent.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(intent.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Investment History */}
      {executions.length > 0 && (
        <div className="bg-background rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-500">
            <h3 className="text-lg font-semibold text-white">
              Investment History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {executions.slice(0, 10).map((execution) => (
                  <tr key={execution.id} className="hover:bg-background">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {getTokenDisplay(
                          execution.source_token,
                          execution.source_chain
                        )}{" "}
                        →{" "}
                        {getTokenDisplay(
                          execution.target_token,
                          execution.target_chain
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {execution.transaction_hash ? (
                          <a
                            href={`https://etherscan.io/tx/${execution.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple hover:text-blue-800"
                          >
                            View on Explorer
                          </a>
                        ) : (
                          "No transaction hash"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ${execution.amount_usd}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ${parseFloat(execution.fee_paid || "0").toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(execution.status)}
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            execution.status
                          )}`}
                        >
                          {execution.status.charAt(0).toUpperCase() +
                            execution.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {execution.executed_at
                        ? new Date(execution.executed_at).toLocaleDateString()
                        : new Date(execution.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {executions.length > 10 && (
            <div className="px-6 py-4 border-t border-gray-500 text-center">
              <p className="text-sm text-gray-500">
                Showing 10 of {executions.length} executions
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {intents.length === 0 && executions.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-500 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No investments yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start your investment journey by creating your first recurring
            investment.
          </p>
          <a
            href="/create"
            className="inline-flex items-center px-4 py-2 bg-purple text-white rounded-md hover:bg-purple-dark"
          >
            Create Investment
          </a>
        </div>
      )}
    </div>
  );
}
