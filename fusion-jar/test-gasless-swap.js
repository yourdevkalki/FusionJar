// Test script for gasless swap functionality
const { oneInchAPI } = require("./lib/1inch.ts");

async function testGaslessSwap() {
  console.log("🧪 Testing Gasless Swap Functionality...\n");

  // Test 1: Get Quote
  console.log("1. Testing Quote API...");
  try {
    const quote = await oneInchAPI.getQuote({
      src: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
      dst: "0x4200000000000000000000000000000000000006", // WETH on Base
      amount: "5000000", // $5 USDC (6 decimals)
      from: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      chainId: 8453, // Base chain
    });

    console.log("✅ Quote received:", {
      srcAmount: quote.srcAmount,
      dstAmount: quote.dstAmount,
      fee: quote.fee,
      resolver: quote.resolver,
    });
  } catch (error) {
    console.log("❌ Quote test failed:", error.message);
  }

  // Test 2: Create Intent
  console.log("\n2. Testing Intent Creation...");
  try {
    const intent = await oneInchAPI.createIntent({
      src: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
      dst: "0x4200000000000000000000000000000000000006", // WETH on Base
      amount: "5000000", // $5 USDC (6 decimals)
      from: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      chainId: 8453, // Base chain
    });

    console.log("✅ Intent created:", {
      id: intent.id,
      status: intent.status,
      src: intent.src,
      dst: intent.dst,
      amount: intent.amount,
    });
  } catch (error) {
    console.log("❌ Intent creation failed:", error.message);
  }

  console.log("\n🎉 Gasless swap functionality test completed!");
  console.log("\nTo test the full flow:");
  console.log("1. Start the development server: npm run dev");
  console.log("2. Navigate to http://localhost:3000/gasless-swap");
  console.log("3. Connect your wallet (MetaMask with Base network)");
  console.log("4. Select tokens and try the gasless swap");
}

// Run the test
testGaslessSwap().catch(console.error);
