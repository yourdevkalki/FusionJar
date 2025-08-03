#!/usr/bin/env tsx

/**
 * Investment Executor Cron Job Runner
 *
 * This script runs the investment execution cron job.
 * It can be executed manually or scheduled via cron.
 *
 * Usage:
 * - Manual: npm run cron:investments
 * - Cron: 0,30 * * * * cd /path/to/project && npm run cron:investments
 */

import dotenv from "dotenv";
import { safeRunInvestmentExecutor } from "../lib/cron/investment-executor";

// Load environment variables
dotenv.config({ path: ".env.local" });

/**
 * Main entry point
 */
async function main() {
  console.log("🔄 Starting investment executor cron job...");

  // Validate environment
  if (!process.env.NODE_ENV) {
    console.log("NODE_ENV not set, assuming production environment");
  }

  // Run the investment executor
  await safeRunInvestmentExecutor();

  console.log("✅ Investment executor cron job completed");
  process.exit(0);
}

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log("\n⚠️ Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️ Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("🚨 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error("🚨 Fatal error in cron job:", error);
  process.exit(1);
});
