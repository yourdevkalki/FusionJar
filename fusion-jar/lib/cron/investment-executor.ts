import {
  fetchActiveIntents,
  getUserPrivateKey,
  logExecution,
  updateIntentNextExecution,
  checkAndMarkFailedIntent,
  getExecutionStats,
} from "./database";
import {
  checkAllChainBalances,
  findBestSourceChain,
  determineSwapType,
  usdToUsdcAmount,
} from "./balance-checker";
import { executeSwap } from "./swap-executor";
import { InvestmentIntent, InvestmentExecution, SwapParams } from "./types";

/**
 * Process a single investment intent
 */
async function processIntent(intent: InvestmentIntent): Promise<void> {
  const executionLog: InvestmentExecution = {
    intent_id: intent.id,
    user_address: intent.user_address,
    source_token: intent.source_token,
    source_chain: intent.source_chain,
    target_token: intent.target_token,
    target_chain: intent.target_chain,
    amount_usd: intent.amount,
    status: "pending",
    executed_at: new Date(),
  };

  try {
    console.log(`\n🎯 Processing intent: ${intent.jar_name} (${intent.id})`);
    console.log(`💰 Amount: $${intent.amount} USD`);
    console.log(
      `🎯 Target: ${intent.target_token} on chain ${intent.target_chain}`
    );

    // Step 1: Get user's private key
    console.log("\n🔐 Step 1: Getting user wallet...");
    const privateKey = await getUserPrivateKey(intent.user_address);
    if (!privateKey) {
      throw new Error("Failed to retrieve user private key");
    }

    // Step 2: Check USDC balances across all chains
    console.log("\n💎 Step 2: Checking USDC balances...");
    const balances = await checkAllChainBalances(intent.user_address);

    if (balances.length === 0) {
      throw new Error("No chain balances could be retrieved");
    }

    // Step 3: Find best source chain for the swap
    console.log("\n🔍 Step 3: Finding optimal source chain...");
    const bestSourceChain = findBestSourceChain(
      balances,
      intent.amount,
      intent.target_chain
    );

    if (!bestSourceChain) {
      executionLog.status = "skipped";
      executionLog.error_message = `Insufficient USDC balance (need $${intent.amount})`;
      await logExecution(executionLog);
      console.log(`⏭️ Skipping intent ${intent.id}: Insufficient balance`);
      return;
    }

    // Step 4: Determine swap type
    console.log("\n🔄 Step 4: Determining swap strategy...");
    const swapType = determineSwapType(
      bestSourceChain.chainId,
      intent.target_chain
    );

    // Step 5: Execute the swap
    console.log("\n🚀 Step 5: Executing swap...");
    const swapParams: SwapParams = {
      sourceChain: bestSourceChain.chainId,
      targetChain: intent.target_chain,
      sourceToken: bestSourceChain.usdcAddress,
      targetToken: intent.target_token,
      amountUSD: intent.amount,
      userAddress: intent.user_address,
      privateKey,
    };

    const swapResult = await executeSwap(swapParams);

    // Step 6: Update execution log with results
    if (swapResult.success) {
      console.log(`✅ Swap successful for intent ${intent.id}`);

      executionLog.status = "fulfilled";
      executionLog.transaction_hash = swapResult.transactionHash;
      executionLog.actual_amount_in = swapResult.actualAmountIn;
      executionLog.actual_amount_out = swapResult.actualAmountOut;
      executionLog.fee_paid = swapResult.feePaid;
      executionLog.resolver_address = swapResult.resolverAddress;

      // Update intent's next execution time
      await updateIntentNextExecution(intent.id, intent.frequency);
    } else {
      console.log(
        `❌ Swap failed for intent ${intent.id}: ${swapResult.error}`
      );

      executionLog.status = "failed";
      executionLog.error_message = swapResult.error;

      // Check if intent should be marked as failed due to consecutive failures
      await checkAndMarkFailedIntent(intent.id);
    }

    // Log the execution
    await logExecution(executionLog);
  } catch (error) {
    console.error(`❌ Error processing intent ${intent.id}:`, error);

    executionLog.status = "failed";
    executionLog.error_message =
      error instanceof Error ? error.message : "Unknown error";

    await logExecution(executionLog);
    await checkAndMarkFailedIntent(intent.id);
  }
}

/**
 * Main cron job function - processes all active intents
 */
export async function runInvestmentExecutor(): Promise<void> {
  const startTime = Date.now();

  console.log("\n🚀 ========================================");
  console.log("🚀 INVESTMENT EXECUTOR CRON JOB STARTED");
  console.log("🚀 ========================================");
  console.log(`⏰ Execution time: ${new Date().toISOString()}`);

  try {
    // Validate required environment variables
    const requiredEnvVars = [
      "ONE_INCH_API_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "NEXT_PUBLIC_DEMO_PRIVATE_KEY",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }

    // Fetch all active intents
    console.log("\n📊 Fetching active investment intents...");
    const activeIntents = await fetchActiveIntents();

    if (activeIntents.length === 0) {
      console.log("ℹ️ No active intents found for execution");
      return;
    }

    console.log(`📋 Found ${activeIntents.length} active intents to process`);

    // Process each intent individually (to prevent one failure from affecting others)
    for (let i = 0; i < activeIntents.length; i++) {
      const intent = activeIntents[i];

      console.log(`\n📦 Processing intent ${i + 1}/${activeIntents.length}`);
      console.log(`📋 Intent: ${intent.jar_name} (${intent.id})`);

      try {
        await processIntent(intent);
      } catch (error) {
        console.error(`❌ Failed to process intent ${intent.id}:`, error);
        // Continue with next intent
      }

      // Add small delay between intents to avoid rate limiting
      if (i < activeIntents.length - 1) {
        console.log("⏳ Waiting 2 seconds before next intent...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Get execution statistics
    console.log("\n📊 Getting execution statistics...");
    await getExecutionStats();
  } catch (error) {
    console.error("❌ Critical error in investment executor:", error);
  } finally {
    const duration = Date.now() - startTime;
    console.log("\n✅ ========================================");
    console.log("✅ INVESTMENT EXECUTOR CRON JOB COMPLETED");
    console.log("✅ ========================================");
    console.log(
      `⏱️ Total execution time: ${(duration / 1000).toFixed(2)} seconds`
    );
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);
  }
}

/**
 * Error handling wrapper for the cron job
 */
export async function safeRunInvestmentExecutor(): Promise<void> {
  try {
    await runInvestmentExecutor();
  } catch (error) {
    console.error("🚨 CRITICAL ERROR in investment executor cron job:", error);

    // Log critical error to database or monitoring system
    // In production, you might want to send alerts here

    // Don't throw - we want the cron to continue running
  }
}
