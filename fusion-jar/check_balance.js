/**
 * Check USDC Balance and Allowance Script
 */

require("dotenv").config();
const { Web3 } = require("web3");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NODE_URL = process.env.NODE_URL;

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

async function main() {
  const normalizedKey = normalizeKey(PRIVATE_KEY);
  const web3 = new Web3(NODE_URL);
  const account = web3.eth.accounts.privateKeyToAccount(normalizedKey);
  const walletAddress = account.address;

  console.log("Wallet address:", walletAddress);
  console.log("RPC chain ID:", await web3.eth.getChainId());

  // USDC contract on Base
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const fusionSpender = "0x2ad5004c60e16e54d5007c80ce329adde5b51ef5"; // Settlement address from quote

  const usdcAbi = [
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
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
  ];

  const usdcContract = new web3.eth.Contract(usdcAbi, usdcAddress);

  // Check USDC balance
  const balance = await usdcContract.methods.balanceOf(walletAddress).call();
  console.log("\n=== BALANCE CHECK ===");
  console.log("USDC Balance:", Number(balance) / 1e6, "USDC");
  console.log("USDC Balance (raw):", balance);

  // Check allowance
  const allowance = await usdcContract.methods
    .allowance(walletAddress, fusionSpender)
    .call();
  console.log("\n=== ALLOWANCE CHECK ===");
  console.log("Fusion Spender:", fusionSpender);
  console.log("USDC Allowance:", Number(allowance) / 1e6, "USDC");
  console.log("USDC Allowance (raw):", allowance);

  // Check if we have enough for the swap (10 USDC)
  const requiredAmount = 10 * 1e6; // 10 USDC in smallest units
  console.log("\n=== REQUIREMENTS CHECK ===");
  console.log("Required amount:", requiredAmount / 1e6, "USDC");
  console.log("Has enough balance:", Number(balance) >= requiredAmount);
  console.log("Has enough allowance:", Number(allowance) >= requiredAmount);

  if (Number(balance) < requiredAmount) {
    console.log("❌ Insufficient USDC balance");
  } else {
    console.log("✅ Sufficient USDC balance");
  }

  if (Number(allowance) < requiredAmount) {
    console.log("❌ Insufficient USDC allowance");
  } else {
    console.log("✅ Sufficient USDC allowance");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
