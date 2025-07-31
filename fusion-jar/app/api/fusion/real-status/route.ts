import { NextRequest, NextResponse } from "next/server";
import {
  FusionSDK,
  NetworkEnum,
  PrivateKeyProviderConnector,
} from "@1inch/fusion-sdk";
import { JsonRpcProvider } from "ethers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderHash = searchParams.get("orderHash");

    // Validate required parameters
    if (!orderHash) {
      return NextResponse.json(
        { error: "Missing required parameter: orderHash" },
        { status: 400 }
      );
    }

    // Get environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const NODE_URL =
      process.env.BASE_RPC || process.env.WEB3_NODE_URL || "https://mainnet.base.org";
    const DEV_PORTAL_API_TOKEN = process.env.ONE_INCH_API_KEY;

    if (!privateKey || !DEV_PORTAL_API_TOKEN) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    // Initialize Fusion SDK
    const reliableRpcUrl = "https://mainnet.base.org";
    const ethersRpcProvider = new JsonRpcProvider(reliableRpcUrl, {
      name: "base",
      chainId: 8453
    });
    const ethersProviderConnector = {
      eth: {
        call: function (transactionConfig: any) {
          return ethersRpcProvider.call(transactionConfig);
        },
      },
      extend: function () {},
    };

    const connector = new PrivateKeyProviderConnector(
      privateKey,
      ethersProviderConnector
    );

    const sdk = new FusionSDK({
      url: "https://api.1inch.dev/fusion",
      network: NetworkEnum.COINBASE,
      blockchainProvider: connector,
      authKey: DEV_PORTAL_API_TOKEN,
    });

    // Get order status using Fusion SDK
    console.log("Checking order status for:", orderHash);
    const data = await sdk.getOrderStatus(orderHash);
    console.log("Order status:", data);

    return NextResponse.json({
      orderHash: orderHash,
      status: data.status,
      fills: data.fills || [],
      message: `Order status: ${data.status}`,
    });
  } catch (error) {
    console.error("Fusion SDK status check error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
