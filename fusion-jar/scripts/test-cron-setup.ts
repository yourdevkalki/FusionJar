#!/usr/bin/env tsx

/**
 * Test Script for Investment Cron System
 *
 * This script validates that all components of the cron system are properly configured.
 * Run this before deploying to production.
 */

import dotenv from "dotenv";
import { checkAllChainBalances } from "../lib/cron/balance-checker";
import { fetchActiveIntents, getExecutionStats } from "../lib/cron/database";
import { SUPPORTED_CHAINS } from "../lib/cron/types";

// Load environment variables
dotenv.config({ path: ".env.local" });

/**
 * Test environment variables
 */
function testEnvironment(): boolean {
  console.log("\n🔧 Testing Environment Variables...");

  const requiredVars = [
    "ONE_INCH_API_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_DEMO_PRIVATE_KEY",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
    return false;
  }

  console.log("✅ All required environment variables are set");
  return true;
}

/**
 * Test chain connectivity
 */
async function testChainConnectivity(): Promise<boolean> {
  console.log("\n🌐 Testing Chain Connectivity...");

  const { Web3 } = await import("web3");

  for (const [chainId, config] of Object.entries(SUPPORTED_CHAINS)) {
    try {
      const web3 = new Web3(config.rpcUrl);
      const blockNumber = await web3.eth.getBlockNumber();
      console.log(`✅ ${config.name} (${chainId}): Block ${blockNumber}`);
    } catch (error) {
      console.error(`❌ ${config.name} (${chainId}): Connection failed`);
      console.error(error);
      return false;
    }
  }

  return true;
}

/**
 * Test database connectivity
 */
async function testDatabase(): Promise<boolean> {
  console.log("\n📊 Testing Database Connectivity...");

  try {
    const stats = await getExecutionStats();
    console.log("✅ Database connection successful");
    console.log(`📈 Execution stats: ${JSON.stringify(stats)}`);

    const intents = await fetchActiveIntents();
    console.log(`📋 Found ${intents.length} active intents`);

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

/**
 * Test balance checking
 */
async function testBalanceChecker(): Promise<boolean> {
  console.log("\n💰 Testing Balance Checker...");

  try {
    // Use a known address with potential balances (replace with actual test address)
    const testAddress = "0x40511448CD8854c9E89241648f3F52BB5A609C2e";
    console.log(`Testing with address: ${testAddress}`);

    const balances = await checkAllChainBalances(testAddress);

    if (balances.length === 0) {
      console.log(
        "⚠️ No balances found (this might be expected for test addresses)"
      );
    } else {
      console.log("✅ Balance checker working correctly");
      balances.forEach((balance) => {
        console.log(`  ${balance.chainName}: ${balance.balanceFormatted} USDC`);
      });
    }

    return true;
  } catch (error) {
    console.error("❌ Balance checker failed:", error);
    return false;
  }
}

/**
 * Test 1inch API connectivity
 */
async function test1inchAPI(): Promise<boolean> {
  console.log("\n🔄 Testing 1inch API Connectivity...");

  try {
    // Test basic API connectivity with a simple request
    const response = await fetch(
      "https://api.1inch.dev/swap/v6.0/8453/tokens",
      {
        headers: {
          Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      `✅ 1inch API connection successful (found ${
        Object.keys(data.tokens || {}).length
      } tokens)`
    );

    return true;
  } catch (error) {
    console.error("❌ 1inch API connection failed:", error);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests(): Promise<void> {
  console.log("🧪 ========================================");
  console.log("🧪 INVESTMENT CRON SYSTEM TEST");
  console.log("🧪 ========================================");

  const tests = [
    { name: "Environment Variables", test: testEnvironment },
    { name: "Chain Connectivity", test: testChainConnectivity },
    { name: "Database", test: testDatabase },
    { name: "Balance Checker", test: testBalanceChecker },
    { name: "1inch API", test: test1inchAPI },
  ];

  const results: { name: string; passed: boolean }[] = [];

  for (const { name, test } of tests) {
    try {
      const passed = await test();
      results.push({ name, passed });
    } catch (error) {
      console.error(`❌ Test "${name}" threw an error:`, error);
      results.push({ name, passed: false });
    }
  }

  // Summary
  console.log("\n📊 ========================================");
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("📊 ========================================");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach(({ name, passed }) => {
    console.log(`${passed ? "✅" : "❌"} ${name}`);
  });

  console.log(`\n📈 Overall: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All tests passed! Cron system is ready for deployment.");
    process.exit(0);
  } else {
    console.log(
      "⚠️ Some tests failed. Please fix the issues before deploying."
    );
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("🚨 Fatal error running tests:", error);
  process.exit(1);
});
