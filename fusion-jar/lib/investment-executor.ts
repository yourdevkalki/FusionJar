import { supabase } from "./supabase";
import { getBestQuote } from "./1inch";

interface ExecutionResult {
  success: boolean;
  executionId?: string;
  error?: string;
  transactionHash?: string;
  feePaid?: string;
}

interface InvestmentIntent {
  id: string;
  user_address: string;
  source_token: string;
  source_chain: number;
  target_token: string;
  target_chain: number;
  amount_usd: number;
  fee_tolerance: number;
}

export async function executeInvestment(
  intent: InvestmentIntent
): Promise<ExecutionResult> {
  try {
    console.log(
      `Executing investment ${intent.id} for user ${intent.user_address}`
    );

    // Step 1: Get the best quote for the swap
    const quote = await getBestQuote({
      fromToken: intent.source_token,
      toToken: intent.target_token,
      fromChain: intent.source_chain,
      toChain: intent.target_chain,
      amount: intent.amount_usd.toString(),
      userAddress: intent.user_address,
    });

    if (!quote.success) {
      return {
        success: false,
        error: `Failed to get quote: ${quote.error}`,
      };
    }

    // Step 2: Check if the quote meets fee tolerance
    const feePercentage =
      (parseFloat(quote.fee || "0") / intent.amount_usd) * 100;
    if (feePercentage > intent.fee_tolerance) {
      return {
        success: false,
        error: `Fee ${feePercentage.toFixed(2)}% exceeds tolerance ${
          intent.fee_tolerance
        }%`,
      };
    }

    // Step 3: Create execution record
    const { data: execution, error: executionError } = await supabase
      .from("investment_executions")
      .insert({
        intent_id: intent.id,
        user_address: intent.user_address,
        source_token: intent.source_token,
        source_chain: intent.source_chain,
        target_token: intent.target_token,
        target_chain: intent.target_chain,
        amount_usd: intent.amount_usd,
        actual_amount_in: quote.amountIn,
        actual_amount_out: quote.amountOut,
        fee_paid: quote.fee,
        resolver_address: quote.resolver || null,
        status: "pending",
      })
      .select()
      .single();

    if (executionError) {
      return {
        success: false,
        error: `Failed to create execution record: ${executionError.message}`,
      };
    }

    // Step 4: Execute the swap (this would integrate with actual resolver)
    const swapResult = await executeSwap(quote, intent.user_address);

    if (swapResult.success) {
      // Step 5: Update execution record with success
      await supabase
        .from("investment_executions")
        .update({
          status: "fulfilled",
          transaction_hash: swapResult.transactionHash,
          executed_at: new Date().toISOString(),
        })
        .eq("id", execution.id);

      // Step 6: Record resolver data for transparency
      await supabase.from("resolver_data").insert({
        resolver_address: quote.resolver || "unknown",
        execution_id: execution.id,
        fee_earned: quote.fee,
        execution_time_ms: swapResult.executionTime,
        success: true,
      });

      return {
        success: true,
        executionId: execution.id,
        transactionHash: swapResult.transactionHash,
        feePaid: quote.fee,
      };
    } else {
      // Step 7: Update execution record with failure
      await supabase
        .from("investment_executions")
        .update({
          status: "failed",
        })
        .eq("id", execution.id);

      // Record resolver data for transparency
      await supabase.from("resolver_data").insert({
        resolver_address: quote.resolver || "unknown",
        execution_id: execution.id,
        fee_earned: "0",
        execution_time_ms: 0,
        success: false,
      });

      return {
        success: false,
        executionId: execution.id,
        error: swapResult.error,
      };
    }
  } catch (error) {
    console.error("Error executing investment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function executeSwap(
  quote: any,
  userAddress: string
): Promise<{
  success: boolean;
  transactionHash?: string;
  executionTime?: number;
  error?: string;
}> {
  // This is a placeholder for the actual swap execution
  // In a real implementation, this would:
  // 1. Call the resolver's execute function
  // 2. Wait for transaction confirmation
  // 3. Return the transaction hash and execution time

  const startTime = Date.now();

  try {
    // Simulate swap execution with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate success (in real implementation, this would be the actual swap result)
    const success = Math.random() > 0.1; // 90% success rate for demo

    if (success) {
      return {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        executionTime: Date.now() - startTime,
      };
    } else {
      return {
        success: false,
        error: "Swap execution failed",
        executionTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      executionTime: Date.now() - startTime,
    };
  }
}

// Function to get execution statistics
export async function getExecutionStats() {
  const { data: stats, error } = await supabase
    .from("investment_executions")
    .select("status")
    .gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    ); // Last 24 hours

  if (error) {
    console.error("Error fetching execution stats:", error);
    return null;
  }

  const total = stats?.length || 0;
  const successful = stats?.filter((s) => s.status === "fulfilled").length || 0;
  const failed = stats?.filter((s) => s.status === "failed").length || 0;
  const pending = stats?.filter((s) => s.status === "pending").length || 0;

  return {
    total,
    successful,
    failed,
    pending,
    successRate: total > 0 ? (successful / total) * 100 : 0,
  };
}
