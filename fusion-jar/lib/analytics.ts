import { supabase } from "./supabase";
import { getExecutionStats } from "./investment-executor";
import { getResolverStats } from "./resolver-transparency";
import { getLeaderboard } from "./gamification";

export interface PortfolioAnalytics {
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

export interface MonthlyBreakdown {
  month: string;
  invested: number;
  returned: number;
  roi: number;
  executions: number;
  fees: number;
}

export interface PerformancePoint {
  date: string;
  value: number;
  invested: number;
  roi_percentage: number;
}

export interface SystemAnalytics {
  total_users: number;
  total_volume: number;
  total_executions: number;
  success_rate: number;
  average_fee: number;
  top_resolvers: any[];
  top_tokens: any[];
  recent_activity: any[];
  system_health: SystemHealth;
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  average_response_time: number;
  error_rate: number;
  active_resolvers: number;
}

export async function getPortfolioAnalytics(
  userAddress: string,
  timeframe: "7d" | "30d" | "90d" = "30d"
): Promise<PortfolioAnalytics> {
  try {
    const startDate = getStartDate(timeframe);

    // Get user's investment data
    const { data: executions, error } = await supabase
      .from("investment_executions")
      .select("*")
      .eq("user_address", userAddress)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching portfolio analytics:", error);
      return getEmptyPortfolioAnalytics();
    }

    if (!executions || executions.length === 0) {
      return getEmptyPortfolioAnalytics();
    }

    // Calculate basic metrics
    const totalInvested = executions.reduce(
      (sum, exec) => sum + parseFloat(exec.amount_usd || "0"),
      0
    );
    const successfulExecutions = executions.filter(
      (exec) => exec.status === "fulfilled"
    );
    const totalFees = executions.reduce(
      (sum, exec) => sum + parseFloat(exec.fee_paid || "0"),
      0
    );
    const successRate =
      executions.length > 0
        ? (successfulExecutions.length / executions.length) * 100
        : 0;
    const averageFee =
      executions.length > 0 ? totalFees / executions.length : 0;

    // Calculate ROI (simplified - in real implementation, you'd track actual token values)
    const totalReturned = successfulExecutions.reduce((sum, exec) => {
      // Simulate ROI based on execution time (older = more ROI)
      const executionDate = new Date(exec.executed_at || exec.created_at);
      const daysSinceExecution =
        (Date.now() - executionDate.getTime()) / (1000 * 60 * 60 * 24);
      const roiMultiplier = 1 + daysSinceExecution * 0.001; // 0.1% daily ROI
      return sum + parseFloat(exec.amount_usd || "0") * roiMultiplier;
    }, 0);

    const totalROI = totalReturned - totalInvested;
    const totalROIPercentage =
      totalInvested > 0 ? (totalROI / totalInvested) * 100 : 0;

    // Generate monthly breakdown
    const monthlyBreakdown = generateMonthlyBreakdown(executions);

    // Generate performance timeline
    const performanceTimeline = generatePerformanceTimeline(executions);

    // Find best/worst performing tokens (simplified)
    const tokenPerformance = calculateTokenPerformance(executions);
    const bestToken =
      Object.entries(tokenPerformance).sort(
        ([, a], [, b]) => b.roi - a.roi
      )[0]?.[0] || "N/A";
    const worstToken =
      Object.entries(tokenPerformance).sort(
        ([, a], [, b]) => a.roi - b.roi
      )[0]?.[0] || "N/A";

    return {
      total_invested: totalInvested,
      current_value: totalReturned,
      total_roi: totalROI,
      total_roi_percentage: totalROIPercentage,
      total_executions: executions.length,
      successful_executions: successfulExecutions.length,
      success_rate: successRate,
      average_fee: averageFee,
      total_fees_paid: totalFees,
      best_performing_token: bestToken,
      worst_performing_token: worstToken,
      monthly_breakdown: monthlyBreakdown,
      performance_timeline: performanceTimeline,
    };
  } catch (error) {
    console.error("Error in getPortfolioAnalytics:", error);
    return getEmptyPortfolioAnalytics();
  }
}

export async function getSystemAnalytics(): Promise<SystemAnalytics> {
  try {
    // Get system-wide statistics
    const [executionStats, resolverStats, gamificationData] = await Promise.all(
      [getExecutionStats(), getResolverStats(), getLeaderboard(5)]
    );

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from("investment_executions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    // Calculate system health
    const systemHealth = await calculateSystemHealth();

    // Get top tokens by volume
    const { data: tokenData } = await supabase
      .from("investment_executions")
      .select("source_token, target_token, amount_usd")
      .gte(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      );

    const topTokens = calculateTopTokens(tokenData || []);

    return {
      total_users: gamificationData.length,
      total_volume: executionStats?.total || 0,
      total_executions: executionStats?.total || 0,
      success_rate: executionStats?.successRate || 0,
      average_fee: 0, // Would need to calculate from fee data
      top_resolvers: resolverStats.slice(0, 5),
      top_tokens: topTokens,
      recent_activity: recentActivity || [],
      system_health: systemHealth,
    };
  } catch (error) {
    console.error("Error in getSystemAnalytics:", error);
    return getEmptySystemAnalytics();
  }
}

export async function getInvestmentInsights(userAddress: string) {
  try {
    const { data: executions } = await supabase
      .from("investment_executions")
      .select("*")
      .eq("user_address", userAddress)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!executions || executions.length === 0) {
      return {
        insights: [],
        recommendations: [],
      };
    }

    const insights = generateInsights(executions);
    const recommendations = generateRecommendations(executions);

    return {
      insights,
      recommendations,
    };
  } catch (error) {
    console.error("Error in getInvestmentInsights:", error);
    return {
      insights: [],
      recommendations: [],
    };
  }
}

// Helper functions
function getStartDate(timeframe: "7d" | "30d" | "90d"): Date {
  const now = new Date();
  switch (timeframe) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function generateMonthlyBreakdown(executions: any[]): MonthlyBreakdown[] {
  const monthlyData: { [key: string]: any } = {};

  executions.forEach((execution) => {
    const date = new Date(execution.created_at);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        invested: 0,
        returned: 0,
        roi: 0,
        executions: 0,
        fees: 0,
      };
    }

    const amount = parseFloat(execution.amount_usd || "0");
    const fee = parseFloat(execution.fee_paid || "0");

    monthlyData[monthKey].invested += amount;
    monthlyData[monthKey].executions += 1;
    monthlyData[monthKey].fees += fee;

    if (execution.status === "fulfilled") {
      // Simulate returns
      const executionDate = new Date(
        execution.executed_at || execution.created_at
      );
      const daysSinceExecution =
        (Date.now() - executionDate.getTime()) / (1000 * 60 * 60 * 24);
      const roiMultiplier = 1 + daysSinceExecution * 0.001;
      const returned = amount * roiMultiplier;
      monthlyData[monthKey].returned += returned;
      monthlyData[monthKey].roi =
        monthlyData[monthKey].returned - monthlyData[monthKey].invested;
    }
  });

  return Object.values(monthlyData).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}

function generatePerformanceTimeline(executions: any[]): PerformancePoint[] {
  const timeline: { [key: string]: any } = {};
  let cumulativeInvested = 0;
  let cumulativeValue = 0;

  executions.forEach((execution) => {
    const date = new Date(execution.created_at).toISOString().split("T")[0];
    const amount = parseFloat(execution.amount_usd || "0");

    cumulativeInvested += amount;

    if (execution.status === "fulfilled") {
      const executionDate = new Date(
        execution.executed_at || execution.created_at
      );
      const daysSinceExecution =
        (Date.now() - executionDate.getTime()) / (1000 * 60 * 60 * 24);
      const roiMultiplier = 1 + daysSinceExecution * 0.001;
      cumulativeValue += amount * roiMultiplier;
    } else {
      cumulativeValue += amount; // Assume no ROI for failed/pending
    }

    timeline[date] = {
      date,
      value: cumulativeValue,
      invested: cumulativeInvested,
      roi_percentage:
        cumulativeInvested > 0
          ? ((cumulativeValue - cumulativeInvested) / cumulativeInvested) * 100
          : 0,
    };
  });

  return Object.values(timeline).sort((a, b) => a.date.localeCompare(b.date));
}

function calculateTokenPerformance(executions: any[]): {
  [key: string]: { invested: number; roi: number };
} {
  const tokenData: { [key: string]: { invested: number; roi: number } } = {};

  executions.forEach((execution) => {
    const sourceToken = execution.source_token;
    const targetToken = execution.target_token;
    const amount = parseFloat(execution.amount_usd || "0");

    if (!tokenData[sourceToken]) {
      tokenData[sourceToken] = { invested: 0, roi: 0 };
    }
    if (!tokenData[targetToken]) {
      tokenData[targetToken] = { invested: 0, roi: 0 };
    }

    tokenData[sourceToken].invested += amount;
    tokenData[targetToken].invested += amount;

    if (execution.status === "fulfilled") {
      const executionDate = new Date(
        execution.executed_at || execution.created_at
      );
      const daysSinceExecution =
        (Date.now() - executionDate.getTime()) / (1000 * 60 * 60 * 24);
      const roiMultiplier = 1 + daysSinceExecution * 0.001;
      const roi = amount * (roiMultiplier - 1);

      tokenData[sourceToken].roi += roi;
      tokenData[targetToken].roi += roi;
    }
  });

  return tokenData;
}

function calculateTopTokens(tokenData: any[]): any[] {
  const tokenVolumes: { [key: string]: number } = {};

  tokenData.forEach((execution) => {
    const sourceToken = execution.source_token;
    const targetToken = execution.target_token;
    const amount = parseFloat(execution.amount_usd || "0");

    tokenVolumes[sourceToken] = (tokenVolumes[sourceToken] || 0) + amount;
    tokenVolumes[targetToken] = (tokenVolumes[targetToken] || 0) + amount;
  });

  return Object.entries(tokenVolumes)
    .map(([token, volume]) => ({ token, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);
}

async function calculateSystemHealth(): Promise<SystemHealth> {
  // This would integrate with actual system monitoring
  // For now, return simulated data
  return {
    status: "healthy",
    uptime: 99.9,
    average_response_time: 150,
    error_rate: 0.1,
    active_resolvers: 5,
  };
}

function generateInsights(executions: any[]): string[] {
  const insights: string[] = [];

  if (executions.length === 0) return insights;

  const successRate =
    executions.filter((e) => e.status === "fulfilled").length /
    executions.length;
  const averageAmount =
    executions.reduce((sum, e) => sum + parseFloat(e.amount_usd || "0"), 0) /
    executions.length;

  if (successRate > 0.9) {
    insights.push(
      "Your investment success rate is excellent at " +
        (successRate * 100).toFixed(1) +
        "%"
    );
  } else if (successRate < 0.7) {
    insights.push(
      "Consider reviewing your investment strategy - success rate is " +
        (successRate * 100).toFixed(1) +
        "%"
    );
  }

  if (averageAmount > 1000) {
    insights.push(
      "You're making substantial investments averaging $" +
        averageAmount.toFixed(0)
    );
  }

  const recentExecutions = executions.slice(0, 5);
  const recentSuccessRate =
    recentExecutions.filter((e) => e.status === "fulfilled").length /
    recentExecutions.length;

  if (recentSuccessRate > successRate) {
    insights.push("Your recent performance is improving!");
  }

  return insights;
}

function generateRecommendations(executions: any[]): string[] {
  const recommendations: string[] = [];

  if (executions.length === 0) {
    recommendations.push("Start with a small investment to test the system");
    return recommendations;
  }

  const successRate =
    executions.filter((e) => e.status === "fulfilled").length /
    executions.length;

  if (successRate < 0.8) {
    recommendations.push(
      "Consider increasing your fee tolerance to improve success rate"
    );
  }

  const averageAmount =
    executions.reduce((sum, e) => sum + parseFloat(e.amount_usd || "0"), 0) /
    executions.length;

  if (averageAmount < 100) {
    recommendations.push(
      "Consider increasing investment amounts to reduce fee impact"
    );
  }

  recommendations.push(
    "Diversify your token selection for better risk management"
  );
  recommendations.push(
    "Set up recurring investments for consistent portfolio growth"
  );

  return recommendations;
}

function getEmptyPortfolioAnalytics(): PortfolioAnalytics {
  return {
    total_invested: 0,
    current_value: 0,
    total_roi: 0,
    total_roi_percentage: 0,
    total_executions: 0,
    successful_executions: 0,
    success_rate: 0,
    average_fee: 0,
    total_fees_paid: 0,
    best_performing_token: "N/A",
    worst_performing_token: "N/A",
    monthly_breakdown: [],
    performance_timeline: [],
  };
}

function getEmptySystemAnalytics(): SystemAnalytics {
  return {
    total_users: 0,
    total_volume: 0,
    total_executions: 0,
    success_rate: 0,
    average_fee: 0,
    top_resolvers: [],
    top_tokens: [],
    recent_activity: [],
    system_health: {
      status: "healthy",
      uptime: 100,
      average_response_time: 0,
      error_rate: 0,
      active_resolvers: 0,
    },
  };
}
