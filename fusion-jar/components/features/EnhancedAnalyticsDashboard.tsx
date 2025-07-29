"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

interface PortfolioAnalytics {
  total_invested: number;
  current_value: number;
  total_roi: number;
  total_roi_percentage: number;
  total_executions: number;
  successful_executions: number;
  success_rate: number;
  average_fee: number;
  total_fees_paid: number;
  best_performing_token: string;
  worst_performing_token: string;
  monthly_breakdown: MonthlyBreakdown[];
  performance_timeline: PerformancePoint[];
}

interface MonthlyBreakdown {
  month: string;
  invested: number;
  returned: number;
  roi: number;
  executions: number;
  fees: number;
}

interface PerformancePoint {
  date: string;
  value: number;
  invested: number;
  roi_percentage: number;
}

interface InvestmentInsights {
  insights: string[];
  recommendations: string[];
}

export default function EnhancedAnalyticsDashboard() {
  const { address, authenticatedFetch } = useAuth();
  const [portfolioAnalytics, setPortfolioAnalytics] =
    useState<PortfolioAnalytics | null>(null);
  const [insights, setInsights] = useState<InvestmentInsights | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "7d" | "30d" | "90d"
  >("30d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchAnalytics();
    }
  }, [address, selectedTimeframe]);

  const fetchAnalytics = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const [analyticsResponse, insightsResponse] = await Promise.all([
        authenticatedFetch(
          `/api/analytics/portfolio/${address}?timeframe=${selectedTimeframe}`
        ),
        authenticatedFetch(
          `/api/analytics/portfolio/${address}?action=insights`
        ),
      ]);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setPortfolioAnalytics(analyticsData);
      }

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getROIColor = (roi: number) => {
    return roi >= 0 ? "text-green-600" : "text-red-600";
  };

  const getROIIcon = (roi: number) => {
    return roi >= 0 ? (
      <TrendingUp className="w-5 h-5" />
    ) : (
      <TrendingDown className="w-5 h-5" />
    );
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

  if (!portfolioAnalytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Analytics Available
        </h3>
        <p className="text-gray-500 mb-6">
          Start investing to see your portfolio analytics and insights.
        </p>
        <a
          href="/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Investment
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Portfolio Analytics
        </h2>
        <div className="flex space-x-2">
          {(["7d", "30d", "90d"] as const).map((timeframe) => (
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Invested
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolioAnalytics.total_invested)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolioAnalytics.current_value)}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total ROI</p>
              <div className="flex items-center">
                <p
                  className={`text-2xl font-bold ${getROIColor(
                    portfolioAnalytics.total_roi_percentage
                  )}`}
                >
                  {formatPercentage(portfolioAnalytics.total_roi_percentage)}
                </p>
                <span className="ml-2">
                  {getROIIcon(portfolioAnalytics.total_roi_percentage)}
                </span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {portfolioAnalytics.success_rate.toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Performance Overview and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Timeline */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-blue-500" />
              Performance Timeline
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {portfolioAnalytics.performance_timeline
                .slice(-7)
                .map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(point.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Invested: {formatCurrency(point.invested)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(point.value)}
                      </p>
                      <p
                        className={`text-xs ${getROIColor(
                          point.roi_percentage
                        )}`}
                      >
                        {formatPercentage(point.roi_percentage)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Insights and Recommendations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Insights & Recommendations
            </h3>
          </div>
          <div className="p-6">
            {insights ? (
              <div className="space-y-6">
                {/* Insights */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-blue-500" />
                    Key Insights
                  </h4>
                  <div className="space-y-2">
                    {insights.insights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 bg-blue-50 rounded-lg"
                      >
                        <ArrowUpRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-500" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {insights.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 bg-green-50 rounded-lg"
                      >
                        <ArrowDownRight className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800">
                          {recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500">No insights available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            Monthly Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Returned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Executions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioAnalytics.monthly_breakdown.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(month.invested)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(month.returned)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${getROIColor(
                        month.roi
                      )}`}
                    >
                      {formatPercentage((month.roi / month.invested) * 100)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {month.executions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(month.fees)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Token Performance and Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-indigo-500" />
              Token Performance
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Best Performer
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {portfolioAnalytics.best_performing_token}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Worst Performer
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {portfolioAnalytics.worst_performing_token}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-500" />
              Additional Metrics
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Executions</span>
                <span className="text-sm font-medium text-gray-900">
                  {portfolioAnalytics.total_executions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Successful Executions
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {portfolioAnalytics.successful_executions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Fee</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(portfolioAnalytics.average_fee)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Fees Paid</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(portfolioAnalytics.total_fees_paid)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
