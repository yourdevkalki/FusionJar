import { Web3 } from "web3";
import { randomBytes } from "crypto";
import {
  FusionSDK,
  NetworkEnum,
  OrderStatus,
  PrivateKeyProviderConnector,
} from "@1inch/fusion-sdk";
import { JsonRpcProvider } from "ethers";
import {
  SwapParams,
  SwapResult,
  SUPPORTED_CHAINS,
  USDC_DECIMALS,
} from "./types";

// ERC20 ABI for approvals
const ERC20_ABI = [
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

/**
 * Helper function to normalize private key
 */
function normalizePrivateKey(rawKey: string): string {
  let key = rawKey.trim();
  if (key.startsWith("0x") || key.startsWith("0X")) {
    key = key.slice(2);
  }
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error("Private key must be a 64-character hex string");
  }
  return "0x" + key;
}

/**
 * Helper function to sleep
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Approve USDC spending for 1inch contracts
 */
async function approveUSDC(
  web3: Web3,
  privateKey: string,
  userAddress: string,
  usdcAddress: string,
  spenderAddress: string,
  amount: string
): Promise<boolean> {
  try {
    const usdcContract = new web3.eth.Contract(ERC20_ABI, usdcAddress);

    // Check current allowance
    const currentAllowance = await usdcContract.methods
      .allowance(userAddress, spenderAddress)
      .call();

    const requiredAmount = parseInt(amount);

    console.log(
      `Current allowance: ${
        Number(currentAllowance) / Math.pow(10, USDC_DECIMALS)
      } USDC`
    );
    console.log(
      `Required amount: ${requiredAmount / Math.pow(10, USDC_DECIMALS)} USDC`
    );

    if (Number(currentAllowance) >= requiredAmount) {
      console.log("✅ Sufficient USDC allowance already exists");
      return true;
    }

    console.log("❌ Insufficient allowance. Approving USDC...");

    // Approve generous amount (1000 USDC)
    const approveAmount = (1000 * Math.pow(10, USDC_DECIMALS)).toString();
    const approveTx = usdcContract.methods.approve(
      spenderAddress,
      approveAmount
    );

    const gasEstimate = await approveTx.estimateGas({ from: userAddress });
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(userAddress);

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: usdcAddress,
        data: approveTx.encodeABI(),
        gas: Math.floor(Number(gasEstimate) * 1.2),
        gasPrice,
        nonce,
      },
      privateKey
    );

    console.log("Sending approval transaction...");
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction!
    );
    console.log(
      `✅ USDC approval successful! Hash: ${receipt.transactionHash}`
    );

    // Wait for transaction to be processed
    await sleep(3000);

    return true;
  } catch (error) {
    console.error("❌ Error approving USDC:", error);
    return false;
  }
}

/**
 * Execute Fusion swap (same chain)
 */
export async function executeFusionSwap(
  params: SwapParams
): Promise<SwapResult> {
  try {
    console.log(`🔄 Starting Fusion swap on chain ${params.sourceChain}`);

    const chainConfig =
      SUPPORTED_CHAINS[params.sourceChain as keyof typeof SUPPORTED_CHAINS];
    if (!chainConfig) {
      throw new Error(`Unsupported source chain: ${params.sourceChain}`);
    }

    const normalizedKey = normalizePrivateKey(params.privateKey);
    const web3 = new Web3(chainConfig.rpcUrl);
    const account = web3.eth.accounts.privateKeyToAccount(normalizedKey);

    // Create ethers provider for Fusion SDK
    const ethersProvider = new JsonRpcProvider(chainConfig.rpcUrl);
    const ethersConnector = {
      eth: {
        call: function (transactionConfig: any) {
          return ethersProvider.call(transactionConfig);
        },
      },
      extend: function () {},
    };

    const connector = new PrivateKeyProviderConnector(
      normalizedKey,
      ethersConnector
    );

    const sdk = new FusionSDK({
      url: "https://api.1inch.dev/fusion",
      network: chainConfig.networkEnum as any,
      blockchainProvider: connector,
      authKey: process.env.ONE_INCH_API_KEY!,
    });

    // Convert USD to USDC amount
    const usdcAmount = (
      params.amountUSD * Math.pow(10, USDC_DECIMALS)
    ).toString();

    const quoteParams = {
      fromTokenAddress: chainConfig.usdcAddress, // USDC
      toTokenAddress: params.targetToken,
      amount: usdcAmount,
      walletAddress: params.userAddress,
      source: "fusion-jar-cron",
    };

    console.log("Getting Fusion quote...");
    const quote = await sdk.getQuote(quoteParams);

    // Approve USDC spending
    const spenderAddress = quote.settlementAddress.val;
    const approved = await approveUSDC(
      web3,
      normalizedKey,
      params.userAddress,
      chainConfig.usdcAddress,
      spenderAddress,
      usdcAmount
    );

    if (!approved) {
      throw new Error("Failed to approve USDC spending");
    }

    console.log("Creating Fusion order...");
    const preparedOrder = await sdk.createOrder(quoteParams);

    console.log("Submitting Fusion order...");
    const orderInfo = await sdk.submitOrder(
      preparedOrder.order,
      preparedOrder.quoteId
    );
    console.log(`Order hash: ${orderInfo.orderHash}`);

    // Poll for order completion
    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes timeout

    while (Date.now() - startTime < timeout) {
      try {
        const statusData = await sdk.getOrderStatus(orderInfo.orderHash);

        if (statusData.status === OrderStatus.Filled) {
          console.log("✅ Fusion order filled:", statusData.fills);

          return {
            success: true,
            transactionHash:
              statusData.fills?.[0]?.txHash || orderInfo.orderHash,
            actualAmountIn: usdcAmount,
            actualAmountOut: statusData.fills?.[0]?.dstTokenAmount,
            resolverAddress: statusData.fills?.[0]?.resolver,
          };
        }

        if (statusData.status === OrderStatus.Expired) {
          throw new Error("Order expired");
        }

        if (statusData.status === OrderStatus.Cancelled) {
          throw new Error("Order cancelled");
        }

        await sleep(3000); // Poll every 3 seconds
      } catch (pollError) {
        console.error("Error polling order status:", pollError);
        await sleep(3000);
      }
    }

    throw new Error("Order timeout - not filled within 5 minutes");
  } catch (error) {
    console.error("❌ Fusion swap failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute Fusion+ swap (cross-chain) - Simplified version using regular Fusion
 * Note: Cross-chain SDK is not available, so we use regular Fusion for now
 */
export async function executeFusionPlusSwap(
  params: SwapParams
): Promise<SwapResult> {
  try {
    console.log(
      `🌉 Starting cross-chain swap: ${params.sourceChain} → ${params.targetChain}`
    );
    console.log("⚠️ Cross-chain SDK not available, using regular Fusion swap");

    // For now, we'll use regular Fusion swap on the source chain
    // In production, you'd implement proper cross-chain bridging
    return await executeFusionSwap(params);
  } catch (error) {
    console.error("❌ Cross-chain swap failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main swap executor - determines type and executes appropriate swap
 */
export async function executeSwap(params: SwapParams): Promise<SwapResult> {
  console.log(
    `🚀 Executing swap: ${params.amountUSD} USD from ${params.sourceChain} to ${params.targetChain}`
  );

  if (params.sourceChain === params.targetChain) {
    return await executeFusionSwap(params);
  } else {
    return await executeFusionPlusSwap(params);
  }
}
