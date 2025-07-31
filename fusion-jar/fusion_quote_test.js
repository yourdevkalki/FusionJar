/**
 * Fusion SDK Quote Test Script
 *
 * This script tests the Fusion SDK quote functionality without executing any swaps.
 * Useful for testing API connectivity and getting price quotes.
 */

require("dotenv").config();
const {
  FusionSDK,
  NetworkEnum,
  PrivateKeyProviderConnector,
} = require("@1inch/fusion-sdk");
const { JsonRpcProvider, computeAddress, formatUnits } = require("ethers");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NODE_URL = process.env.NODE_URL;
const DEV_PORTAL_API_TOKEN = process.env.ONE_INCH_API_KEY;

const ethersRpcProvider = new JsonRpcProvider(NODE_URL);

const ethersProviderConnector = {
  eth: {
    call: function (transactionConfig) {
      return ethersRpcProvider.call(transactionConfig);
    },
  },
  extend: function () {},
};

const connector = new PrivateKeyProviderConnector(
  PRIVATE_KEY,
  ethersProviderConnector
);

const sdk = new FusionSDK({
  url: "https://api.1inch.dev/fusion",
  network: NetworkEnum.COINBASE,
  blockchainProvider: connector,
  authKey: DEV_PORTAL_API_TOKEN,
});

async function main() {
  const walletAddress = computeAddress(
    PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : "0x" + PRIVATE_KEY
  );
  console.log("Wallet address:", walletAddress);

  const params = {
    fromTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
    toTokenAddress: "0x4200000000000000000000000000000000000006", // Base WETH
    amount: "10000000", // 10 USDC (USDC has 6 decimals)
    walletAddress: walletAddress,
    source: "fusion-sdk-demo",
  };

  try {
    console.log("Getting quote...");
    const quote = await sdk.getQuote(params);

    const dstTokenDecimals = 18;
    console.log("\n=== QUOTE RESULTS ===");
    console.log("From: 10 USDC");
    console.log(
      "To: ~",
      formatUnits(
        quote.presets[quote.recommendedPreset].auctionStartAmount,
        dstTokenDecimals
      ),
      "WETH (auction start)"
    );
    console.log(
      "To: ~",
      formatUnits(
        quote.presets[quote.recommendedPreset].auctionEndAmount,
        dstTokenDecimals
      ),
      "WETH (auction end)"
    );
    console.log("Recommended preset:", quote.recommendedPreset);
    console.log("Quote ID:", quote.quoteId);
    console.log("✅ Quote received successfully!");
  } catch (error) {
    console.error("❌ Error getting quote:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

main().catch(console.error);
