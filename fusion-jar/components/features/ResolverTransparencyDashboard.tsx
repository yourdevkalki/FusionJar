"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  BarChart3,
  Shield,
  Zap,
  Target,
  Users,
  Eye,
} from "lucide-react";

interface ResolverStats {
  resolver_address: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
  total_fees_earned: string;
  average_execution_time: number;
  total_volume_processed: string;
  last_execution: string;
  performance_score: number;
}

interface ExecutionAnalytics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
  average_fee: number;
  average_execution_time: number;
  total_volume: number;
  top_resolvers: ResolverStats[];
  recent_executions: any[];
}

export default function ResolverTransparencyDashboard() {
  const { authenticatedFetch } = useAuth();
  const [analytics, setAnalytics] = useState<ExecutionAnalytics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "24h" | "7d" | "30d"
  >("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeframe]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/resolvers/analytics?timeframe=${selectedTimeframe}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching resolver analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fulfilled":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Analytics Available
        </h3>
        <p className="text-gray-500">
          Resolver analytics will appear here once executions begin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Resolver Transparency
        </h2>
        <div className="flex space-x-2">
          {(["24h", "7d", "30d"] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Executions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.total_executions}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.success_rate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Execution Time
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(analytics.average_execution_time)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.total_volume.toFixed(0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Top Resolvers and Recent Executions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Resolvers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              Top Performing Resolvers
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.top_resolvers.map((resolver, index) => (
                <div
                  key={resolver.resolver_address}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-3">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatAddress(resolver.resolver_address)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {resolver.total_executions} executions •{" "}
                        {resolver.success_rate.toFixed(1)}% success
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${getPerformanceColor(
                        resolver.performance_score
                      )}`}
                    >
                      {resolver.performance_score}/100
                    </p>
                    <p className="text-xs text-gray-500">
                      ${parseFloat(resolver.total_fees_earned).toFixed(2)}{" "}
                      earned
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-green-500" />
              Recent Executions
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics.recent_executions.slice(0, 8).map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    {getStatusIcon(execution.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        ${parseFloat(execution.amount_usd).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatAddress(execution.user_address)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        execution.status
                      )}`}
                    >
                      {execution.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(execution.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Resolver Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Resolver Performance Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Executions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees Earned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.top_resolvers.map((resolver) => (
                <tr
                  key={resolver.resolver_address}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatAddress(resolver.resolver_address)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resolver.total_executions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${resolver.success_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {resolver.success_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(resolver.average_execution_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(resolver.total_volume_processed).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(resolver.total_fees_earned).toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(
                        resolver.performance_score
                      )} bg-opacity-10`}
                    >
                      {resolver.performance_score}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">System Health</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Resolvers</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.top_resolvers.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Fee</span>
              <span className="text-sm font-medium text-gray-900">
                ${analytics.average_fee.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.success_rate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Performance Metrics
            </h4>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Best Resolver</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.top_resolvers[0]
                  ? formatAddress(analytics.top_resolvers[0].resolver_address)
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Top Score</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.top_resolvers[0]
                  ? analytics.top_resolvers[0].performance_score
                  : 0}
                /100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fastest Time</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.top_resolvers.length > 0
                  ? formatTime(
                      Math.min(
                        ...analytics.top_resolvers.map(
                          (r) => r.average_execution_time
                        )
                      )
                    )
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Volume Analysis
            </h4>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Volume</span>
              <span className="text-sm font-medium text-gray-900">
                ${analytics.total_volume.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg per Execution</span>
              <span className="text-sm font-medium text-gray-900">
                $
                {analytics.total_executions > 0
                  ? (
                      analytics.total_volume / analytics.total_executions
                    ).toFixed(2)
                  : "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Fees</span>
              <span className="text-sm font-medium text-gray-900">
                $
                {analytics.top_resolvers
                  .reduce((sum, r) => sum + parseFloat(r.total_fees_earned), 0)
                  .toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
