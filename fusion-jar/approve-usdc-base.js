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

  // USDC contract on Base
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // 1inch Fusion+ contract on Base (this is the spender that needs approval)
  const oneInchSpender = "0xa7bcb4eac8964306f9e3764f67db6a7af6ddf99a"; // From the quote response

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

  // Check current allowance
  const currentAllowance = await usdcContract.methods
    .allowance(walletAddress, oneInchSpender)
    .call();
  const usdcDecimals = await usdcContract.methods.decimals().call();

  console.log(
    "Current allowance for 1inch contract:",
    Number(currentAllowance) / Math.pow(10, Number(usdcDecimals)),
    "USDC"
  );
  console.log("Current allowance (raw):", currentAllowance);

  const requiredAmount = 0.1 * Math.pow(10, Number(usdcDecimals)); // 1.7 USDC
  console.log("Required amount:", requiredAmount);

  if (Number(currentAllowance) >= requiredAmount) {
    console.log("✅ Sufficient allowance already exists");
    return;
  }

  console.log("❌ Insufficient allowance. Approving...");

  // Approve the 1inch contract to spend USDC
  const approveAmount = "1000000000"; // 1000 USDC (generous allowance)

  const approveTx = usdcContract.methods.approve(oneInchSpender, approveAmount);
  const gasEstimate = await approveTx.estimateGas({ from: walletAddress });

  console.log("Gas estimate for approval:", gasEstimate);

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: usdcAddress,
      data: approveTx.encodeABI(),
      gas: Math.floor(Number(gasEstimate) * 1.2), // Add 20% buffer
      gasPrice: await web3.eth.getGasPrice(),
      nonce: await web3.eth.getTransactionCount(walletAddress),
    },
    normalizedKey
  );

  console.log("Sending approval transaction...");
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("✅ Approval transaction successful!");
  console.log("Transaction hash:", receipt.transactionHash);

  // Verify the new allowance
  const newAllowance = await usdcContract.methods
    .allowance(walletAddress, oneInchSpender)
    .call();
  console.log(
    "New allowance:",
    Number(newAllowance) / Math.pow(10, Number(usdcDecimals)),
    "USDC"
  );
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
