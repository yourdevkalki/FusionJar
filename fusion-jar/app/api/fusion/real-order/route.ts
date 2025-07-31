import { NextRequest, NextResponse } from "next/server";
import {
  FusionSDK,
  NetworkEnum,
  PrivateKeyProviderConnector,
} from "@1inch/fusion-sdk";
import { JsonRpcProvider, Contract, Wallet } from "ethers";

// Helper function to normalize private key
function normalizeKey(rawKey: string): string {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromTokenAddress, toTokenAddress, amount, walletAddress, source } =
      body;

    // Validate required parameters
    if (!fromTokenAddress || !toTokenAddress || !amount || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const NODE_URL =
      process.env.BASE_RPC ||
      process.env.WEB3_NODE_URL ||
      "https://mainnet.base.org";
    const DEV_PORTAL_API_TOKEN = process.env.ONE_INCH_API_KEY;

    console.log("Using RPC URL:", NODE_URL);

    if (!privateKey || !DEV_PORTAL_API_TOKEN) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    // Initialize Fusion SDK
    const normalizedPrivateKey = normalizeKey(privateKey);

    // Use a more reliable RPC URL
    const reliableRpcUrl = "https://mainnet.base.org";
    console.log("Using reliable RPC URL:", reliableRpcUrl);

    const ethersRpcProvider = new JsonRpcProvider(reliableRpcUrl, {
      name: "base",
      chainId: 8453,
    });
    const wallet = new Wallet(normalizedPrivateKey, ethersRpcProvider);

    const ethersProviderConnector = {
      eth: {
        call: function (transactionConfig: any) {
          return ethersRpcProvider.call(transactionConfig);
        },
      },
      extend: function () {},
    };

    const connector = new PrivateKeyProviderConnector(
      normalizedPrivateKey,
      ethersProviderConnector
    );

    const sdk = new FusionSDK({
      url: "https://api.1inch.dev/fusion",
      network: NetworkEnum.COINBASE,
      blockchainProvider: connector,
      authKey: DEV_PORTAL_API_TOKEN,
    });

    // First, get a quote to get the settlement address
    // Fusion requires larger amounts to avoid pathfinder issues
    const minAmount = "10000000"; // 10 USDC minimum for Fusion to work properly
    const adjustedAmount =
      BigInt(amount) < BigInt(minAmount) ? minAmount : amount;

    const quoteParams = {
      fromTokenAddress,
      toTokenAddress,
      amount: adjustedAmount,
      walletAddress,
      source: source || "fusion-sdk-demo",
    };

    if (adjustedAmount !== amount) {
      console.log(
        "Adjusted amount from",
        amount,
        "to",
        adjustedAmount,
        "to meet Fusion minimum requirements"
      );
    }

    console.log("Getting quote with params:", quoteParams);
    let quote;
    try {
      quote = await sdk.getQuote(quoteParams);
      console.log("Quote received:", quote);
    } catch (quoteError: any) {
      console.error("Quote request failed:", quoteError);
      console.error("Quote error details:", {
        message: quoteError.message,
        status: quoteError.status,
        response: quoteError.response?.data,
        config: quoteError.config?.url,
      });

      return NextResponse.json(
        {
          error: "Failed to get quote from Fusion",
          details: quoteError.response?.data || quoteError.message,
          status: quoteError.status,
        },
        { status: 500 }
      );
    }

    // Check and approve USDC if needed
    if (
      fromTokenAddress.toLowerCase() ===
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
    ) {
      const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
      const fusionSpender = quote.settlementAddress.val;

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

      const usdcContract = new Contract(usdcAddress, usdcAbi, wallet);

      // Check USDC balance first
      const balance = await usdcContract.balanceOf(walletAddress);
      console.log(
        "USDC Balance:",
        balance.toString(),
        "(",
        (Number(balance) / 1e6).toFixed(2),
        "USDC)"
      );

      const currentAllowance = await usdcContract.allowance(
        walletAddress,
        fusionSpender
      );
      const requiredAmount = BigInt(adjustedAmount);

      console.log(
        "Current allowance:",
        currentAllowance.toString(),
        "(",
        (Number(currentAllowance) / 1e6).toFixed(2),
        "USDC)"
      );
      console.log(
        "Required amount:",
        requiredAmount.toString(),
        "(",
        (Number(requiredAmount) / 1e6).toFixed(2),
        "USDC)"
      );
      console.log("Fusion spender address:", fusionSpender);

      // Check if balance is sufficient
      if (balance < requiredAmount) {
        return NextResponse.json(
          {
            error: "Insufficient USDC balance",
            required: requiredAmount.toString(),
            balance: balance.toString(),
          },
          { status: 400 }
        );
      }

      if (currentAllowance < requiredAmount) {
        console.log("Insufficient allowance detected!");
        console.log(
          "The user needs to approve USDC for the Fusion settlement contract"
        );
        console.log("Settlement contract address:", fusionSpender);
        console.log(
          "Required allowance:",
          (Number(requiredAmount) / 1e6).toFixed(2),
          "USDC"
        );

        return NextResponse.json(
          {
            error: "USDC allowance required",
            details: "Please approve USDC for the Fusion settlement contract",
            settlementContract: fusionSpender,
            requiredAmount: requiredAmount.toString(),
            currentAllowance: currentAllowance.toString(),
            needsApproval: true,
          },
          { status: 400 }
        );
      } else {
        console.log("Sufficient USDC allowance already exists");
      }
    }

    // Create order using Fusion SDK with the quote we already have
    const orderParams = {
      ...quoteParams,
      preset: quote.recommendedPreset, // Use the recommended preset
    };

    console.log("Creating Fusion order with params:", orderParams);
    const preparedOrder = await sdk.createOrder(orderParams);
    console.log("Created Fusion order:", preparedOrder);

    // Submit order using Fusion SDK
    console.log("Submitting order to relayer...");
    try {
      const info = await sdk.submitOrder(
        preparedOrder.order,
        preparedOrder.quoteId
      );
      console.log("Order submitted successfully:", {
        orderHash: info.orderHash,
        quoteId: preparedOrder.quoteId,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        orderHash: info.orderHash,
        status: "submitted",
        message: "Order submitted successfully using Fusion SDK",
        preparedOrder: preparedOrder,
        actualAmount: adjustedAmount,
        requestedAmount: amount,
        amountAdjusted: adjustedAmount !== amount,
        quoteId: preparedOrder.quoteId,
        timestamp: Date.now(),
      });
    } catch (submitError: any) {
      console.error("Order submission failed:", submitError);
      console.error("Error details:", {
        message: submitError.message,
        status: submitError.status,
        response: submitError.response?.data,
        config: submitError.config?.url,
        orderData: {
          hasOrder: !!preparedOrder?.order,
          hasQuoteId: !!preparedOrder?.quoteId,
          quoteId: preparedOrder?.quoteId,
        },
      });

      // Provide more specific error messages
      let errorMessage = "Order submission failed";
      if (submitError.response?.data?.description) {
        errorMessage = submitError.response.data.description;
      } else if (submitError.message) {
        errorMessage = submitError.message;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: submitError.message,
          status: submitError.status,
          code: submitError.code,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Fusion SDK order creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
