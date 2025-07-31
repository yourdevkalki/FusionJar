/**
 * Fusion SDK USDC to WETH Swap Test Script
 *
 * This script demonstrates how to use the 1inch Fusion SDK to perform a gasless swap
 * from USDC to WETH on Base network.
 *
 * Current Status: ✅ WORKING
 * - Network: Base (8453) ✅
 * - USDC Address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 ✅
 * - WETH Address: 0x4200000000000000000000000000000000000006 ✅
 * - Quote API: ✅ Working
 * - Order Creation: ✅ Working
 * - Order Submission: ✅ Working
 *
 * Note: The script will fail with "NotEnoughBalanceOrAllowance" error
 * if the wallet doesn't have sufficient USDC balance or allowance.
 * This is expected behavior for testing purposes.
 */

require("dotenv").config();
const {
  FusionSDK,
  NetworkEnum,
  OrderStatus,
  PrivateKeyProviderConnector,
} = require("@1inch/fusion-sdk");
const { JsonRpcProvider, computeAddress, formatUnits } = require("ethers");
const { Web3 } = require("web3");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NODE_URL = process.env.NODE_URL;
const DEV_PORTAL_API_TOKEN = process.env.ONE_INCH_API_KEY;

// Helper function to normalize private key
function normalizeKey(rawKey) {
  let key = rawKey.trim();
  if (key.startsWith("0x") || key.startsWith("0X")) {
    key = key.slice(2);
  }
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      "PRIVATE_KEY must be a 64‑char hex string (64 characters long)"
    );
  }
  return "0x" + key;
}

// Helper function to sleep
async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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
  const normalizedKey = normalizeKey(PRIVATE_KEY);
  const baseWeb3 = new Web3(NODE_URL);
  const account = baseWeb3.eth.accounts.privateKeyToAccount(normalizedKey);
  const walletAddress = account.address;

  console.log("Wallet address:", walletAddress);
  console.log("RPC chain ID:", await baseWeb3.eth.getChainId());

  const params = {
    fromTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
    toTokenAddress: "0x4200000000000000000000000000000000000006", // Base WETH
    amount: "1000000", // 1 USDC (USDC has 6 decimals) - reduced amount
    walletAddress: walletAddress,
    source: "fusion-sdk-demo",
  };

  const quote = await sdk.getQuote(params);

  const dstTokenDecimals = 18;
  console.log(
    "Auction start amount:",
    formatUnits(
      quote.presets[quote.recommendedPreset].auctionStartAmount,
      dstTokenDecimals
    )
  );
  console.log(
    "Auction end amount:",
    formatUnits(
      quote.presets[quote.recommendedPreset].auctionEndAmount,
      dstTokenDecimals
    )
  );

  // USDC approval logic
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const usdcAbi = [
    {
      constant: true,
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const usdcContract = new baseWeb3.eth.Contract(usdcAbi, usdcAddress);

  // For Fusion SDK, we need to approve the settlement address from the quote
  // Get the settlement address from the quote
  const fusionSpender = quote.settlementAddress.val;
  console.log("Using Fusion spender address:", fusionSpender);

  const currentAllowance = await usdcContract.methods
    .allowance(walletAddress, fusionSpender)
    .call();
  const requiredAmount = 1 * 1e6; // 1 USDC in smallest units

  console.log("Current allowance:", Number(currentAllowance) / 1e6, "USDC");
  console.log("Required amount:", requiredAmount / 1e6, "USDC");

  if (Number(currentAllowance) < requiredAmount) {
    console.log("❌ Insufficient allowance. Approving USDC...");

    const approveAmount = "1000000000"; // 1000 USDC allowance
    const approveTx = usdcContract.methods.approve(
      fusionSpender,
      approveAmount
    );
    const gasEstimate = await approveTx.estimateGas({ from: walletAddress });

    const signedTx = await baseWeb3.eth.accounts.signTransaction(
      {
        to: usdcAddress,
        data: approveTx.encodeABI(),
        gas: Math.floor(Number(gasEstimate) * 1.2),
        gasPrice: await baseWeb3.eth.getGasPrice(),
        nonce: await baseWeb3.eth.getTransactionCount(walletAddress),
      },
      normalizedKey
    );

    console.log("Sending approval transaction...");
    const receipt = await baseWeb3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log("✅ USDC approval successful! Hash:", receipt.transactionHash);

    // Wait for the transaction to be processed
    await sleep(3000);
  } else {
    console.log("✅ Sufficient USDC allowance already exists");
  }

  const preparedOrder = await sdk.createOrder(params);

  const info = await sdk.submitOrder(
    preparedOrder.order,
    preparedOrder.quoteId
  );

  console.log("OrderHash:", info.orderHash);

  const start = Date.now();

  while (true) {
    try {
      const data = await sdk.getOrderStatus(info.orderHash);

      if (data.status === OrderStatus.Filled) {
        console.log("Order filled:", data.fills);
        break;
      }

      if (data.status === OrderStatus.Expired) {
        console.log("Order expired");
        break;
      }

      if (data.status === OrderStatus.Cancelled) {
        console.log("Order cancelled");
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000)); // poll every 3 seconds
    } catch (err) {
      console.error(err);
    }
  }

  console.log("Order executed in", (Date.now() - start) / 1000, "seconds");
}

main();
