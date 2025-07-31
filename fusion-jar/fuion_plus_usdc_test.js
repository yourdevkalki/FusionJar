require("dotenv").config();
const { Web3 } = require("web3");

const { randomBytes } = require("crypto");
const {
  SDK,
  NetworkEnum,
  PresetEnum,
  OrderStatus,
  PrivateKeyProviderConnector,
  HashLock,
} = require("@1inch/cross-chain-sdk");

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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
  const { PRIVATE_KEY, ONE_INCH_API_KEY, BASE_RPC, POLYGON_RPC } = process.env;

  if (!PRIVATE_KEY || !ONE_INCH_API_KEY || !BASE_RPC || !POLYGON_RPC) {
    console.error(
      "Missing PRIVATE_KEY, ONE_INCH_API_KEY, BASE_RPC, or POLYGON_RPC"
    );
    process.exit(1);
  }

  const baseWeb3 = new Web3(BASE_RPC);
  const normalizedKey = normalizeKey(PRIVATE_KEY);
  const account = baseWeb3.eth.accounts.privateKeyToAccount(normalizedKey);
  const walletAddress = account.address;

  const sdk = new SDK({
    url: "https://api.1inch.dev/fusion-plus",
    authKey: ONE_INCH_API_KEY,
    blockchainProvider: new PrivateKeyProviderConnector(
      normalizedKey,
      baseWeb3
    ),
    network: NetworkEnum.BASE,
  });

  console.log("Wallet:", walletAddress);

  // USDC contract on Base
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // 10 USDC → amount in smallest unit (6 decimals) - meets minimum threshold
  const amount = (1 * 1e6).toString();
  const srcTokenAddress = baseWeb3.utils.toChecksumAddress(usdcAddress); // USDC on Base
  const dstTokenAddress = baseWeb3.utils.toChecksumAddress(
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48"
  ); // USDC on Ethereum

  console.log("RPC chain ID:", await baseWeb3.eth.getChainId());
  console.log("Supported NetworkEnum values:", Object.keys(NetworkEnum));
  console.log("NetworkEnum.BASE:", NetworkEnum.BASE);
  console.log("SRC token (Base USDC):", srcTokenAddress);
  console.log("DST token (ETH USDC):", dstTokenAddress);

  // Get quote first to determine the correct spender address
  console.log("Getting quote for Base USDC → Ethereum USDC...");
  const quote = await sdk.getQuote({
    srcChainId: NetworkEnum.COINBASE, // Base: 8453
    dstChainId: NetworkEnum.ETHEREUM, // Ethereum: 1
    srcTokenAddress,
    dstTokenAddress,
    amount,
    walletAddress,
    enableEstimate: true,
  });

  console.log("Quote srcEscrowFactory:", quote?.srcEscrowFactory?.val);

  // Now check and approve USDC spending for the correct 1inch contract
  console.log("Checking USDC allowance...");
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

  // Use the srcEscrowFactory from the quote as the spender
  const oneInchSpender = quote.srcEscrowFactory.val;
  console.log("Using spender address:", oneInchSpender);

  const currentAllowance = await usdcContract.methods
    .allowance(walletAddress, oneInchSpender)
    .call();
  const requiredAmount = 1 * 1e6; // 10 USDC in smallest units

  console.log("Current allowance:", Number(currentAllowance) / 1e6, "USDC");
  console.log("Required amount:", requiredAmount / 1e6, "USDC");

  if (Number(currentAllowance) < requiredAmount) {
    console.log("❌ Insufficient allowance. Approving USDC...");

    const approveAmount = "1000000000"; // 1000 USDC allowance
    const approveTx = usdcContract.methods.approve(
      oneInchSpender,
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

  console.log(quote);

  // Get preset using official method
  const currentPreset = quote.getPreset();
  const secretsCount = currentPreset.secretsCount;
  console.log("Preset secrets count:", secretsCount);

  // Generate random secrets (32 bytes each)
  const secrets = Array.from({ length: secretsCount }).map(
    () => "0x" + randomBytes(32).toString("hex")
  );
  const secretHashes = secrets.map((x) => HashLock.hashSecret(x));

  const hashLock =
    secretsCount === 1
      ? HashLock.forSingleFill(secrets[0])
      : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

  console.log("Creating order...");
  const {
    hash: orderHash,
    quoteId,
    order,
  } = await sdk.createOrder(quote, {
    walletAddress,
    hashLock,
    secretHashes,
    // Add fee parameter as shown in official docs
    fee: {
      takingFeeBps: 100, // 1% fee (100 basis points)
      takingFeeReceiver: "0x0000000000000000000000000000000000000000", // Fee receiver address
    },
  });
  console.log("Order hash:", orderHash);

  console.log("Submitting order...");
  try {
    await sdk.submitOrder(quote.srcChainId, order, quoteId, secretHashes);
    console.log("Order submitted.");
  } catch (submitError) {
    console.error("Submit order error details:");
    console.error("Error message:", submitError.message);
    if (submitError.response && submitError.response.data) {
      console.error(
        "API Error Response:",
        JSON.stringify(submitError.response.data, null, 2)
      );
      if (submitError.response.data.meta) {
        console.error(
          "Error Meta:",
          JSON.stringify(submitError.response.data.meta, null, 2)
        );
      }
    }
    throw submitError;
  }

  while (true) {
    const secretsToShare = await sdk.getReadyToAcceptSecretFills(orderHash);
    for (const { idx } of secretsToShare.fills) {
      await sdk.submitSecret(orderHash, secrets[idx]);
      console.log("Secret submitted for fill index", idx);
    }

    const statusResp = await sdk.getOrderStatus(orderHash);
    console.log("Status:", statusResp.status);

    if (
      [
        OrderStatus.Executed,
        OrderStatus.Expired,
        OrderStatus.Refunded,
      ].includes(statusResp.status)
    ) {
      console.log("Final status:", statusResp.status);
      console.log("Full response:", statusResp);
      break;
    }

    await sleep(3000);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
