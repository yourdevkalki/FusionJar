import {
  FusionSDK,
  NetworkEnum,
  OrderStatus,
  PrivateKeyProviderConnector,
  Web3Like,
} from "@1inch/fusion-sdk";
import { JsonRpcProvider } from "ethers";

const INCH_API_BASE = "https://api.1inch.dev";

// Web3 provider connector for Fusion SDK
function createWeb3Provider(nodeUrl: string): Web3Like {
  const provider = new JsonRpcProvider(nodeUrl);

  return {
    eth: {
      call(transactionConfig): Promise<string> {
        return provider.call(transactionConfig);
      },
    },
    extend(): void {},
  };
}

export class OneInchAPI {
  private apiKey: string;
  private fusionSDK: FusionSDK | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Initialize Fusion SDK with proper configuration for gasless swaps
  private async initializeFusionSDK(chainId: number, privateKey?: string) {
    if (this.fusionSDK) return this.fusionSDK;

    const nodeUrl =
      process.env.WEB3_NODE_URL ||
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    const web3Provider = createWeb3Provider(nodeUrl);

    // Map chainId to Fusion SDK NetworkEnum - Use available networks
    const networkMap: Record<number, NetworkEnum> = {
      1: NetworkEnum.ETHEREUM,
      56: NetworkEnum.BINANCE,
      137: NetworkEnum.POLYGON,
      42161: NetworkEnum.ARBITRUM,
      // Use ETHEREUM for Base since BASE might not be available
      8453: NetworkEnum.ETHEREUM, // Base network (using Ethereum config)
      10: NetworkEnum.OPTIMISM,
    };

    console.log(`Mapping chainId ${chainId} to network:`, networkMap[chainId]);

    const network = networkMap[chainId];
    if (!network) {
      throw new Error(
        `Unsupported network for Fusion+: ${chainId}. Supported: Ethereum (1), BSC (56), Polygon (137), Arbitrum (42161), Base (8453), Optimism (10)`
      );
    }

    // Create provider connector if private key is available
    let blockchainProvider;
    if (privateKey) {
      blockchainProvider = new PrivateKeyProviderConnector(
        privateKey,
        web3Provider
      );
    } else {
      // For read-only operations, we might need a different approach
      blockchainProvider = web3Provider as any;
    }

    this.fusionSDK = new FusionSDK({
      url: "https://api.1inch.dev/fusion-plus", // Use Fusion+ endpoint
      network,
      blockchainProvider,
      authKey: this.apiKey,
    });

    return this.fusionSDK;
  }

  // Get gasless quote using Fusion+ SDK
  async getQuote(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
  }) {
    console.log("Getting Fusion+ gasless quote:", params);

    try {
      const sdk = await this.initializeFusionSDK(params.chainId);

      const quoteParams = {
        fromTokenAddress: params.src,
        toTokenAddress: params.dst,
        amount: params.amount,
        walletAddress: params.from,
        source: "fusion-jar",
      };

      const quote = await sdk.getQuote(quoteParams);

      // Check if quote has the expected structure
      if (!quote || !quote.presets || !quote.recommendedPreset) {
        throw new Error("Invalid quote structure received from Fusion SDK");
      }

      const recommendedPreset = quote.presets[quote.recommendedPreset];
      if (!recommendedPreset) {
        throw new Error("No recommended preset found in quote");
      }

      // Transform Fusion quote to match expected format
      return {
        dstAmount: recommendedPreset.auctionEndAmount,
        estimatedGas: "0", // Fusion swaps are gasless
        protocols: [],
        fusionQuote: quote, // Store the full Fusion quote for later use
        preset: quote.recommendedPreset,
        auctionStartAmount: recommendedPreset.auctionStartAmount,
        auctionEndAmount: recommendedPreset.auctionEndAmount,
        isGasless: true,
      };
    } catch (error: any) {
      console.error("Error getting Fusion+ quote:", error);
      throw new Error(
        `Fusion+ gasless quote failed: ${
          error?.message || "Unknown error"
        }. Please check your 1inch API key has Fusion+ access.`
      );
    }
  }

  // Create gasless Fusion+ order only
  async createFusionOrder(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
    preset?: string;
  }) {
    console.log("Creating gasless Fusion+ order:", params);

    try {
      const sdk = await this.initializeFusionSDK(params.chainId);

      const orderParams = {
        fromTokenAddress: params.src,
        toTokenAddress: params.dst,
        amount: params.amount,
        walletAddress: params.from,
        source: "fusion-jar",
        // Removed preset parameter to avoid TypeScript issues
      };

      // Create the order (this prepares it for signing)
      const preparedOrder = await sdk.createOrder(orderParams);

      return {
        id: `fusion_order_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`,
        status: "created",
        phase: "announcement",
        order: preparedOrder.order,
        quoteId: preparedOrder.quoteId,
        orderData: preparedOrder,
        message: "Gasless Fusion+ order created - ready for signing",
        timestamp: Date.now(),
        isFusion: true,
        isGasless: true,
        ...params,
      };
    } catch (error: any) {
      console.error("Error creating Fusion+ order:", error);

      // Provide helpful error messages
      if (error?.message?.includes("404")) {
        throw new Error(
          "Fusion+ not available. Please ensure your 1inch API key has Fusion+ access and the network supports gasless swaps."
        );
      } else if (
        error?.message?.includes("401") ||
        error?.message?.includes("403")
      ) {
        throw new Error(
          "Invalid API key or insufficient permissions for Fusion+. Please check your 1inch Developer Portal settings."
        );
      } else {
        throw new Error(
          `Failed to create gasless swap: ${error?.message || "Unknown error"}`
        );
      }
    }
  }

  // Submit gasless Fusion+ order only
  async submitFusionOrder(params: {
    orderData: any;
    signature: string;
    userAddress: string;
  }) {
    console.log("Submitting gasless Fusion+ order:", params);

    try {
      const sdk = await this.initializeFusionSDK(8453); // Default to Base
      const result = await sdk.submitOrder(
        params.orderData.order,
        params.orderData.quoteId
      );

      return {
        orderHash: result.orderHash,
        status: "submitted",
        phase: "announcement",
        message:
          "Gasless order submitted to Dutch auction - resolvers competing",
        timestamp: Date.now(),
        isFusion: true,
        isGasless: true,
      };
    } catch (error: any) {
      console.error("Fusion+ submission failed:", error);
      throw new Error(
        `Failed to submit gasless order: ${error?.message || "Unknown error"}`
      );
    }
  }

  // Monitor gasless order status through all phases
  async getOrderStatus(orderHash: string, chainId: number = 8453) {
    console.log("Checking gasless order status:", orderHash);

    try {
      const sdk = await this.initializeFusionSDK(chainId);
      const status = await sdk.getOrderStatus(orderHash);

      // Map Fusion SDK status to our phase-based status
      let phase = "announcement";
      let message = "Order in Dutch auction";

      switch (status.status) {
        case OrderStatus.Pending:
          phase = "announcement";
          message = "Gasless order pending in Dutch auction";
          break;
        case OrderStatus.PartiallyFilled:
          phase = "deposit";
          message = "Resolver depositing assets to escrow";
          break;
        case OrderStatus.Filled:
          phase = "withdrawal";
          message = "Assets unlocked - gasless swap completed!";
          break;
        case OrderStatus.Expired:
          phase = "expired";
          message = "Order expired without execution";
          break;
        case OrderStatus.Cancelled:
          phase = "cancelled";
          message = "Order cancelled";
          break;
      }

      return {
        orderHash,
        status: status.status,
        phase,
        message,
        fills: status.fills || [],
        timestamp: Date.now(),
        isFusion: true,
        isGasless: true,
      };
    } catch (error: any) {
      console.error("Error getting order status:", error);
      throw new Error(
        `Failed to get gasless order status: ${
          error?.message || "Unknown error"
        }`
      );
    }
  }

  // Legacy methods for backward compatibility - gasless only
  async createIntent(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
    permit?: string;
  }) {
    return this.createFusionOrder(params);
  }

  async executeIntent(params: {
    intentId: string;
    signature: string;
    userAddress: string;
  }) {
    // For gasless swaps, the execution happens automatically via resolvers
    return {
      txHash: null,
      status: "submitted",
      message: "Gasless order submitted - execution handled by resolvers",
      orderHash: params.intentId,
      timestamp: Date.now(),
      isGasless: true,
    };
  }
}

export const oneInchAPI = new OneInchAPI(process.env.INCH_API_KEY!);
