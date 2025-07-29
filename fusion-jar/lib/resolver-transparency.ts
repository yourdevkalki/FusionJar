import { supabase } from "./supabase";

export interface ResolverStats {
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

export interface ExecutionAnalytics {
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

export async function getResolverStats(
  resolverAddress?: string
): Promise<ResolverStats[]> {
  try {
    let query = supabase.from("resolver_data").select(`
        resolver_address,
        success,
        fee_earned,
        execution_time_ms,
        created_at,
        investment_executions!inner(amount_usd)
      `);

    if (resolverAddress) {
      query = query.eq("resolver_address", resolverAddress);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching resolver data:", error);
      return [];
    }

    // Group by resolver address
    const resolverGroups = data?.reduce((acc: any, execution: any) => {
      const address = execution.resolver_address;
      if (!acc[address]) {
        acc[address] = {
          resolver_address: address,
          executions: [],
          total_fees: 0,
          total_volume: 0,
          execution_times: [],
        };
      }

      acc[address].executions.push(execution);
      acc[address].total_fees += parseFloat(execution.fee_earned || "0");
      acc[address].total_volume += parseFloat(
        execution.investment_executions?.amount_usd || "0"
      );
      if (execution.execution_time_ms) {
        acc[address].execution_times.push(execution.execution_time_ms);
      }

      return acc;
    }, {});

    // Calculate stats for each resolver
    const stats: ResolverStats[] = Object.values(resolverGroups).map(
      (group: any) => {
        const total = group.executions.length;
        const successful = group.executions.filter(
          (e: any) => e.success
        ).length;
        const failed = total - successful;
        const successRate = total > 0 ? (successful / total) * 100 : 0;
        const avgExecutionTime =
          group.execution_times.length > 0
            ? group.execution_times.reduce((a: number, b: number) => a + b, 0) /
              group.execution_times.length
            : 0;

        // Calculate performance score (0-100)
        const performanceScore = calculatePerformanceScore({
          successRate,
          avgExecutionTime,
          totalExecutions: total,
          totalVolume: group.total_volume,
        });

        return {
          resolver_address: group.resolver_address,
          total_executions: total,
          successful_executions: successful,
          failed_executions: failed,
          success_rate: successRate,
          total_fees_earned: group.total_fees.toFixed(4),
          average_execution_time: Math.round(avgExecutionTime),
          total_volume_processed: group.total_volume.toFixed(2),
          last_execution:
            group.executions[group.executions.length - 1]?.created_at || "",
          performance_score: performanceScore,
        };
      }
    );

    // Sort by performance score
    return stats.sort((a, b) => b.performance_score - a.performance_score);
  } catch (error) {
    console.error("Error in getResolverStats:", error);
    return [];
  }
}

export async function getExecutionAnalytics(
  timeframe: "24h" | "7d" | "30d" = "7d"
): Promise<ExecutionAnalytics> {
  try {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get execution data
    const { data: executions, error } = await supabase
      .from("investment_executions")
      .select(
        `
        *,
        resolver_data!inner(*)
      `
      )
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching execution analytics:", error);
      return {
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        success_rate: 0,
        average_fee: 0,
        average_execution_time: 0,
        total_volume: 0,
        top_resolvers: [],
        recent_executions: [],
      };
    }

    const total = executions?.length || 0;
    const successful =
      executions?.filter((e) => e.status === "fulfilled").length || 0;
    const failed = executions?.filter((e) => e.status === "failed").length || 0;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    // Calculate fees and execution times
    const fees =
      executions
        ?.map((e) => parseFloat(e.fee_paid || "0"))
        .filter((f) => f > 0) || [];
    const executionTimes =
      executions
        ?.map((e) => e.resolver_data?.execution_time_ms)
        .filter((t) => t) || [];
    const volumes =
      executions?.map((e) => parseFloat(e.amount_usd || "0")) || [];

    const averageFee =
      fees.length > 0 ? fees.reduce((a, b) => a + b, 0) / fees.length : 0;
    const averageExecutionTime =
      executionTimes.length > 0
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
        : 0;
    const totalVolume = volumes.reduce((a, b) => a + b, 0);

    // Get top resolvers
    const topResolvers = await getResolverStats();

    return {
      total_executions: total,
      successful_executions: successful,
      failed_executions: failed,
      success_rate: successRate,
      average_fee: averageFee,
      average_execution_time: Math.round(averageExecutionTime),
      total_volume: totalVolume,
      top_resolvers: topResolvers.slice(0, 5),
      recent_executions: executions?.slice(0, 10) || [],
    };
  } catch (error) {
    console.error("Error in getExecutionAnalytics:", error);
    return {
      total_executions: 0,
      successful_executions: 0,
      failed_executions: 0,
      success_rate: 0,
      average_fee: 0,
      average_execution_time: 0,
      total_volume: 0,
      top_resolvers: [],
      recent_executions: [],
    };
  }
}

export async function getResolverPerformanceHistory(
  resolverAddress: string,
  days: number = 30
) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("resolver_data")
      .select(
        `
        *,
        investment_executions!inner(amount_usd, created_at)
      `
      )
      .eq("resolver_address", resolverAddress)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching resolver performance history:", error);
      return [];
    }

    // Group by day
    const dailyStats = data?.reduce((acc: any, execution: any) => {
      const date = new Date(execution.created_at).toISOString().split("T")[0];

      if (!acc[date]) {
        acc[date] = {
          date,
          executions: 0,
          successful: 0,
          failed: 0,
          volume: 0,
          fees: 0,
          avgExecutionTime: 0,
          executionTimes: [],
        };
      }

      acc[date].executions += 1;
      acc[date].successful += execution.success ? 1 : 0;
      acc[date].failed += execution.success ? 0 : 1;
      acc[date].volume += parseFloat(
        execution.investment_executions?.amount_usd || "0"
      );
      acc[date].fees += parseFloat(execution.fee_earned || "0");

      if (execution.execution_time_ms) {
        acc[date].executionTimes.push(execution.execution_time_ms);
      }

      return acc;
    }, {});

    // Calculate averages and success rates
    return Object.values(dailyStats).map((day: any) => ({
      date: day.date,
      executions: day.executions,
      success_rate:
        day.executions > 0 ? (day.successful / day.executions) * 100 : 0,
      volume: day.volume,
      fees: day.fees,
      avg_execution_time:
        day.executionTimes.length > 0
          ? Math.round(
              day.executionTimes.reduce((a: number, b: number) => a + b, 0) /
                day.executionTimes.length
            )
          : 0,
    }));
  } catch (error) {
    console.error("Error in getResolverPerformanceHistory:", error);
    return [];
  }
}

function calculatePerformanceScore({
  successRate,
  avgExecutionTime,
  totalExecutions,
  totalVolume,
}: {
  successRate: number;
  avgExecutionTime: number;
  totalExecutions: number;
  totalVolume: number;
}): number {
  // Weighted scoring system
  const successWeight = 0.4; // 40% weight for success rate
  const speedWeight = 0.3; // 30% weight for execution speed
  const volumeWeight = 0.2; // 20% weight for volume processed
  const reliabilityWeight = 0.1; // 10% weight for number of executions

  // Normalize values
  const successScore = Math.min(successRate, 100) / 100;
  const speedScore = Math.max(0, 1 - avgExecutionTime / 10000); // Normalize to 10 seconds max
  const volumeScore = Math.min(totalVolume / 10000, 1); // Normalize to $10k max
  const reliabilityScore = Math.min(totalExecutions / 100, 1); // Normalize to 100 executions max

  return (
    Math.round(
      successScore * successWeight +
        speedScore * speedWeight +
        volumeScore * volumeWeight +
        reliabilityScore * reliabilityWeight
    ) * 100
  );
}

export async function getResolverLeaderboard(
  limit: number = 10
): Promise<ResolverStats[]> {
  const stats = await getResolverStats();
  return stats.slice(0, limit);
}

export async function getResolverDetails(resolverAddress: string) {
  try {
    const [stats, history] = await Promise.all([
      getResolverStats(resolverAddress),
      getResolverPerformanceHistory(resolverAddress),
    ]);

    return {
      stats: stats[0] || null,
      history,
      recentExecutions: history.slice(-7), // Last 7 days
    };
  } catch (error) {
    console.error("Error in getResolverDetails:", error);
    return {
      stats: null,
      history: [],
      recentExecutions: [],
    };
  }
}
