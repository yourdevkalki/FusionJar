import { createClient } from "@supabase/supabase-js";
import { InvestmentIntent, InvestmentExecution } from "./types";

// Initialize Supabase client with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ Supabase credentials not found, database operations will fail"
  );
}

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key"
);

/**
 * Fetch active investment intents that are ready for execution
 */
export async function fetchActiveIntents(): Promise<InvestmentIntent[]> {
  try {
    console.log("📊 Fetching active investment intents...");

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("investment_intents")
      .select("*")
      .eq("status", "active")
      .lte("next_execution", now)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error fetching active intents:", error);
      throw error;
    }

    console.log(
      `✅ Found ${data?.length || 0} active intents ready for execution`
    );
    return data || [];
  } catch (error) {
    console.error("❌ Database error fetching intents:", error);
    return [];
  }
}

/**
 * Get user's Privy wallet private key (for transaction signing)
 * Note: In production, this should be securely encrypted/managed
 */
export async function getUserPrivateKey(
  userAddress: string
): Promise<string | null> {
  try {
    console.log(`🔐 Fetching private key for user: ${userAddress}`);

    // For now, using demo private key from env
    // In production, you'd fetch from secure key management
    const privateKey = process.env.NEXT_PUBLIC_DEMO_PRIVATE_KEY;

    if (!privateKey) {
      console.error("❌ No private key found for user");
      return null;
    }

    console.log("✅ Private key retrieved successfully");
    return privateKey;
  } catch (error) {
    console.error("❌ Error fetching private key:", error);
    return null;
  }
}

/**
 * Log execution attempt to investment_executions table
 */
export async function logExecution(
  execution: InvestmentExecution
): Promise<boolean> {
  try {
    console.log(
      `📝 Logging execution for intent ${execution.intent_id} with status: ${execution.status}`
    );

    const { error } = await supabase.from("investment_executions").insert({
      intent_id: execution.intent_id,
      user_address: execution.user_address,
      source_token: execution.source_token,
      source_chain: execution.source_chain,
      target_token: execution.target_token,
      target_chain: execution.target_chain,
      amount_usd: execution.amount_usd,
      actual_amount_in: execution.actual_amount_in,
      actual_amount_out: execution.actual_amount_out,
      fee_paid: execution.fee_paid,
      resolver_address: execution.resolver_address,
      transaction_hash: execution.transaction_hash,
      status: execution.status,
      executed_at: execution.executed_at || new Date().toISOString(),
    });

    if (error) {
      console.error("❌ Error logging execution:", error);
      throw error;
    }

    console.log("✅ Execution logged successfully");
    return true;
  } catch (error) {
    console.error("❌ Database error logging execution:", error);
    return false;
  }
}

/**
 * Update intent's next execution time based on frequency
 */
export async function updateIntentNextExecution(
  intentId: string,
  frequency: string
): Promise<boolean> {
  try {
    console.log(
      `⏰ Updating next execution time for intent ${intentId} with frequency: ${frequency}`
    );

    // Calculate next execution time based on frequency
    const now = new Date();
    const nextExecution = new Date(now);

    switch (frequency.toLowerCase()) {
      case "daily":
        nextExecution.setDate(now.getDate() + 1);
        break;
      case "weekly":
        nextExecution.setDate(now.getDate() + 7);
        break;
      case "monthly":
        nextExecution.setMonth(now.getMonth() + 1);
        break;
      default:
        // Handle custom frequencies like "every X days"
        const match = frequency.match(/every (\d+) days?/i);
        if (match) {
          const days = parseInt(match[1]);
          nextExecution.setDate(now.getDate() + days);
        } else {
          // Default to daily if unknown
          nextExecution.setDate(now.getDate() + 1);
        }
    }

    const { error } = await supabase
      .from("investment_intents")
      .update({
        next_execution: nextExecution.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", intentId);

    if (error) {
      console.error("❌ Error updating intent next execution:", error);
      throw error;
    }

    console.log(
      `✅ Next execution scheduled for: ${nextExecution.toISOString()}`
    );
    return true;
  } catch (error) {
    console.error("❌ Database error updating intent:", error);
    return false;
  }
}

/**
 * Mark intent as failed if multiple consecutive failures
 */
export async function checkAndMarkFailedIntent(
  intentId: string
): Promise<void> {
  try {
    // Get recent execution history for this intent
    const { data: executions, error } = await supabase
      .from("investment_executions")
      .select("status, executed_at")
      .eq("intent_id", intentId)
      .order("executed_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("❌ Error checking execution history:", error);
      return;
    }

    // If last 3 executions were failures, mark intent as failed
    const recentFailures = executions
      ?.slice(0, 3)
      .every((ex) => ex.status === "failed");

    if (recentFailures && executions && executions.length >= 3) {
      console.log(
        `⚠️ Intent ${intentId} has 3 consecutive failures, marking as paused`
      );

      await supabase
        .from("investment_intents")
        .update({
          status: "paused",
          updated_at: new Date().toISOString(),
        })
        .eq("id", intentId);

      console.log(
        `✅ Intent ${intentId} marked as paused due to consecutive failures`
      );
    }
  } catch (error) {
    console.error("❌ Error checking failed intent:", error);
  }
}

/**
 * Get execution statistics for monitoring
 */
export async function getExecutionStats(): Promise<{
  total: number;
  successful: number;
  failed: number;
  pending: number;
}> {
  try {
    const { data, error } = await supabase
      .from("investment_executions")
      .select("status")
      .gte(
        "executed_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      ); // Last 24 hours

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      successful: data?.filter((ex) => ex.status === "fulfilled").length || 0,
      failed: data?.filter((ex) => ex.status === "failed").length || 0,
      pending: data?.filter((ex) => ex.status === "pending").length || 0,
    };

    console.log("📊 Last 24h execution stats:", stats);
    return stats;
  } catch (error) {
    console.error("❌ Error getting execution stats:", error);
    return { total: 0, successful: 0, failed: 0, pending: 0 };
  }
}
