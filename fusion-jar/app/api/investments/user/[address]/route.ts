import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const userAddress = params.address;

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    // Get user's investment intents
    const { data: intents, error: intentsError } = await supabase
      .from("investment_intents")
      .select("*")
      .eq("user_address", userAddress)
      .order("created_at", { ascending: false });

    if (intentsError) {
      console.error("Intents error:", intentsError);
      return NextResponse.json(
        { error: "Failed to fetch investment intents" },
        { status: 500 }
      );
    }

    // Get user's investment executions
    const { data: executions, error: executionsError } = await supabase
      .from("investment_executions")
      .select("*")
      .eq("user_address", userAddress)
      .order("created_at", { ascending: false });

    if (executionsError) {
      console.error("Executions error:", executionsError);
      return NextResponse.json(
        { error: "Failed to fetch investment executions" },
        { status: 500 }
      );
    }

    // Calculate portfolio summary
    const totalInvested =
      executions
        ?.filter((exec) => exec.status === "fulfilled")
        .reduce((sum, exec) => sum + exec.amount_usd, 0) || 0;

    const successfulExecutions =
      executions?.filter((exec) => exec.status === "fulfilled").length || 0;
    const failedExecutions =
      executions?.filter((exec) => exec.status === "failed").length || 0;
    const totalExecutions = executions?.length || 0;

    // Mock current value (in real implementation, this would fetch current prices)
    const currentValue = totalInvested * 1.05; // 5% mock growth
    const roiPercentage =
      totalInvested > 0
        ? ((currentValue - totalInvested) / totalInvested) * 100
        : 0;

    const lastExecution = executions?.[0]?.executed_at || null;

    const portfolioData = {
      total_invested_usd: totalInvested,
      current_value_usd: currentValue,
      total_roi_percentage: roiPercentage,
      total_executions: totalExecutions,
      successful_executions: successfulExecutions,
      failed_executions: failedExecutions,
      last_execution_date: lastExecution,
    };

    return NextResponse.json({
      success: true,
      intents,
      executions,
      portfolio: portfolioData,
    });
  } catch (error) {
    console.error("Get user investments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
