#!/usr/bin/env tsx

/**
 * Continuous Cron Scheduler for Investment Execution
 *
 * This script runs continuously and executes the investment cron job every 30 minutes.
 * It's designed to run as a daemon process in production.
 *
 * Usage:
 * - Development: npm run cron:start
 * - Production: pm2 start scripts/cron-scheduler.ts --name "investment-cron"
 */

import dotenv from "dotenv";
import { safeRunInvestmentExecutor } from "../lib/cron/investment-executor";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Configuration
const CRON_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
const INITIAL_DELAY = 5 * 1000; // 5 seconds initial delay

let isRunning = false;
let cronTimer: NodeJS.Timeout | null = null;

/**
 * Execute the cron job with proper error handling
 */
async function executeCronJob(): Promise<void> {
  if (isRunning) {
    console.log("⚠️ Previous cron job still running, skipping this execution");
    return;
  }

  isRunning = true;

  try {
    console.log(
      `\n🕐 [${new Date().toISOString()}] Starting scheduled investment execution...`
    );
    await safeRunInvestmentExecutor();
    console.log(
      `✅ [${new Date().toISOString()}] Scheduled execution completed successfully`
    );
  } catch (error) {
    console.error(
      `❌ [${new Date().toISOString()}] Error in scheduled execution:`,
      error
    );
  } finally {
    isRunning = false;
  }
}

/**
 * Schedule the next cron job execution
 */
function scheduleNextExecution(): void {
  cronTimer = setTimeout(async () => {
    await executeCronJob();
    scheduleNextExecution(); // Schedule the next execution
  }, CRON_INTERVAL);

  const nextExecution = new Date(Date.now() + CRON_INTERVAL);
  console.log(
    `⏰ Next execution scheduled for: ${nextExecution.toISOString()}`
  );
}

/**
 * Start the cron scheduler
 */
async function startCronScheduler(): Promise<void> {
  console.log("🚀 ========================================");
  console.log("🚀 INVESTMENT CRON SCHEDULER STARTING");
  console.log("🚀 ========================================");
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`⏱️ Interval: Every ${CRON_INTERVAL / 1000 / 60} minutes`);
  console.log(`🔄 Initial delay: ${INITIAL_DELAY / 1000} seconds`);

  // Validate environment
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
    console.error(
      `❌ Missing required environment variables: ${missingVars.join(", ")}`
    );
    process.exit(1);
  }

  console.log("✅ Environment validation passed");

  // Initial execution after delay
  setTimeout(async () => {
    console.log("\n🎯 Running initial execution...");
    await executeCronJob();

    // Start regular scheduling
    scheduleNextExecution();
  }, INITIAL_DELAY);

  console.log(
    `⏳ Waiting ${INITIAL_DELAY / 1000} seconds before first execution...`
  );
}

/**
 * Graceful shutdown
 */
function shutdown(): void {
  console.log("\n⚠️ Shutting down cron scheduler...");

  if (cronTimer) {
    clearTimeout(cronTimer);
    cronTimer = null;
    console.log("✅ Cancelled scheduled timer");
  }

  if (isRunning) {
    console.log("⏳ Waiting for current job to complete...");
    // In a real implementation, you might want to add a timeout here
  }

  console.log("👋 Cron scheduler shut down gracefully");
  process.exit(0);
}

/**
 * Health check endpoint (for monitoring)
 */
function getHealthStatus(): {
  status: string;
  isRunning: boolean;
  nextExecution: string | null;
} {
  const nextExecution = cronTimer
    ? new Date(Date.now() + CRON_INTERVAL).toISOString()
    : null;

  return {
    status: "healthy",
    isRunning,
    nextExecution,
  };
}

// Handle process termination
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("🚨 Uncaught Exception in cron scheduler:", error);
  shutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "🚨 Unhandled Rejection in cron scheduler:",
    promise,
    "reason:",
    reason
  );
  shutdown();
});

// Export health check for external monitoring
export { getHealthStatus };

// Main execution
if (require.main === module) {
  startCronScheduler().catch((error) => {
    console.error("🚨 Fatal error starting cron scheduler:", error);
    process.exit(1);
  });
}
