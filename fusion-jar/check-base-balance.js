require("dotenv").config();
const { Web3 } = require("web3");

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
  const { PRIVATE_KEY, BASE_RPC } = process.env;

  if (!PRIVATE_KEY || !BASE_RPC) {
    console.error("Missing PRIVATE_KEY or BASE_RPC");
    process.exit(1);
  }

  const web3 = new Web3(BASE_RPC);
  const normalizedKey = normalizeKey(PRIVATE_KEY);
  const account = web3.eth.accounts.privateKeyToAccount(normalizedKey);
  const walletAddress = account.address;

  console.log("Wallet:", walletAddress);

  // Check ETH balance on Base
  const ethBalance = await web3.eth.getBalance(walletAddress);
  console.log(
    "ETH Balance (Base):",
    web3.utils.fromWei(ethBalance, "ether"),
    "ETH"
  );

  // Check USDC balance on Base
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
  const usdcAbi = [
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];

  const usdcContract = new web3.eth.Contract(usdcAbi, usdcAddress);
  const usdcBalance = await usdcContract.methods
    .balanceOf(walletAddress)
    .call();
  const usdcDecimals = await usdcContract.methods.decimals().call();

  console.log(
    "USDC Balance (Base):",
    Number(usdcBalance) / Math.pow(10, Number(usdcDecimals)),
    "USDC"
  );
  console.log("USDC Balance (raw):", usdcBalance);

  const requiredAmount = 10 * Math.pow(10, Number(usdcDecimals)); // 10 USDC
  console.log("Required Amount:", requiredAmount);
  console.log("Has Sufficient Balance:", Number(usdcBalance) >= requiredAmount);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
