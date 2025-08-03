import {
  FusionSDK,
  NetworkEnum,
  OrderStatus,
  PrivateKeyProviderConnector,
  Web3Like,
  QuoteParams,
} from "@1inch/fusion-sdk";
import { JsonRpcProvider, computeAddress } from "ethers";

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

  // Get wallet balances using 1inch Balance API
  async getWalletBalances(address: string, chainId: number = 1) {
    try {
      const url = `${INCH_API_BASE}/balance/v1.2/${chainId}/balances/${address}`;

      console.log(`🔍 Fetching balances from: ${url}`);
      console.log(
        `🔑 Using API key: ${
          this.apiKey ? this.apiKey.substring(0, 8) + "..." : "MISSING"
        }`
      );

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          accept: "application/json",
          "content-type": "application/json",
        },
      });

      console.log(
        `📡 Response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ 1inch API Error Response: ${errorText}`);
        throw new Error(
          `1inch Balance API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ Successfully fetched balances. Token count: ${
          Object.keys(data).length
        }`
      );
      return data;
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
      throw error;
    }
  }

  // Get specific token balance
  async getTokenBalance(
    address: string,
    tokenAddress: string,
    chainId: number = 1
  ) {
    try {
      const url = `${INCH_API_BASE}/balance/v1.2/${chainId}/balances/${address}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          accept: "application/json",
          "content-type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ 1inch API Error Response: ${errorText}`);
        throw new Error(
          `1inch Balance API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      // Filter for the specific token if needed
      if (tokenAddress && data[tokenAddress]) {
        return { [tokenAddress]: data[tokenAddress] };
      }

      return data;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      throw error;
    }
  }

  // Initialize Fusion SDK with proper configuration
  private async initializeFusionSDK(chainId: number, privateKey?: string) {
    if (this.fusionSDK) return this.fusionSDK;

    const nodeUrl =
      process.env.WEB3_NODE_URL ||
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    const web3Provider = createWeb3Provider(nodeUrl);

    // Map chainId to Fusion SDK NetworkEnum
    const networkMap: Record<number, NetworkEnum> = {
      1: NetworkEnum.ETHEREUM,
      56: NetworkEnum.BINANCE,
      137: NetworkEnum.POLYGON,
      42161: NetworkEnum.ARBITRUM,
      8453: NetworkEnum.COINBASE,
      10: NetworkEnum.OPTIMISM,
    };

    const network = networkMap[chainId] || NetworkEnum.ETHEREUM;

    // Create provider connector if private key is available
    let connector;
    if (privateKey) {
      connector = new PrivateKeyProviderConnector(privateKey, web3Provider);
    }

    this.fusionSDK = new FusionSDK({
      url: "https://api.1inch.dev/fusion",
      network,
      blockchainProvider: connector || undefined,
      authKey: this.apiKey,
    });

    return this.fusionSDK;
  }

  async getQuote(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
  }) {
    console.log("Getting 1inch quote with params:", params);

    // Use regular 1inch API - it's reliable and working
    const url = `${INCH_API_BASE}/swap/v6.0/${params.chainId}/quote`;
    const queryParams = new URLSearchParams({
      src: params.src,
      dst: params.dst,
      amount: params.amount,
      from: params.from,
    });

    console.log("Calling 1inch API:", `${url}?${queryParams}`);

    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("1inch API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `1inch API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("1inch API quote success:", data);
    return data;
  }

  // Get actual swap transaction data from 1inch API
  async getSwapTransaction(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
    slippage?: number;
  }) {
    console.log("Getting 1inch swap transaction:", params);

    const url = `${INCH_API_BASE}/swap/v6.0/${params.chainId}/swap`;
    const queryParams = new URLSearchParams({
      src: params.src,
      dst: params.dst,
      amount: params.amount,
      from: params.from,
      slippage: (params.slippage || 1).toString(), // Default 1% slippage
    });

    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("1inch swap API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `1inch swap API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("1inch swap transaction success:", data);
    return data;
  }

  // Check token allowance for 1inch router
  async getTokenAllowance(params: {
    tokenAddress: string;
    userAddress: string;
    chainId: number;
  }) {
    console.log("Checking token allowance:", params);

    const url = `${INCH_API_BASE}/swap/v6.0/${params.chainId}/approve/allowance`;
    const queryParams = new URLSearchParams({
      tokenAddress: params.tokenAddress,
      walletAddress: params.userAddress,
    });

    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to check allowance:", response.status);
      return { allowance: "0" }; // Default to 0 if check fails
    }

    const data = await response.json();
    console.log("Token allowance:", data);
    return data;
  }

  // Get approval transaction for 1inch router
  async getApprovalTransaction(params: {
    tokenAddress: string;
    amount?: string;
    chainId: number;
  }) {
    console.log("Getting approval transaction:", params);

    const url = `${INCH_API_BASE}/swap/v6.0/${params.chainId}/approve/transaction`;
    const queryParams = new URLSearchParams({
      tokenAddress: params.tokenAddress,
    });

    // Add amount if specified, otherwise approve infinite
    if (params.amount) {
      queryParams.append("amount", params.amount);
    }

    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("1inch approval API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `1inch approval API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Approval transaction:", data);
    return data;
  }

  // Create a regular 1inch swap (not Fusion+)
  async createSwapOrder(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
    slippage?: number;
  }) {
    console.log("Creating 1inch swap order:", params);

    try {
      // First check if we need approval (only for ERC-20 tokens, not ETH)
      const isEthSwap =
        params.src === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
      let needsApproval = false;
      let approvalTx = null;

      if (!isEthSwap) {
        try {
          const allowanceData = await this.getTokenAllowance({
            tokenAddress: params.src,
            userAddress: params.from,
            chainId: params.chainId,
          });

          const allowance = BigInt(allowanceData.allowance || "0");
          const requiredAmount = BigInt(params.amount);

          if (allowance < requiredAmount) {
            needsApproval = true;
            approvalTx = await this.getApprovalTransaction({
              tokenAddress: params.src,
              amount: params.amount,
              chainId: params.chainId,
            });
          }
        } catch (approvalError) {
          console.warn(
            "Could not check allowance, assuming approval needed:",
            approvalError
          );
          needsApproval = true;
          try {
            approvalTx = await this.getApprovalTransaction({
              tokenAddress: params.src,
              chainId: params.chainId,
            });
          } catch (err) {
            console.error("Failed to get approval transaction:", err);
          }
        }
      }

      if (needsApproval && approvalTx) {
        // Return approval step first
        return {
          id: `inch_approval_${Date.now()}_${Math.random()
            .toString(36)
            .substring(7)}`,
          status: "needs_approval",
          phase: "approval",
          approvalTx: approvalTx,
          message: "Token approval required before swap",
          timestamp: Date.now(),
          needsApproval: true,
          originalParams: params,
          ...params,
        };
      }

      // If no approval needed or approval already done, get swap transaction
      const swapData = await this.getSwapTransaction(params);

      return {
        id: `inch_swap_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`,
        status: "created",
        phase: "ready",
        swapData: swapData,
        tx: swapData.tx,
        message: "1inch swap ready for execution",
        timestamp: Date.now(),
        needsApproval: false,
        ...params,
      };
    } catch (error) {
      console.error("Error creating 1inch swap order:", error);

      // Check if it's an allowance error
      if (
        (error as any).message?.includes("Not enough allowance") ||
        (error as any).message?.includes("allowance")
      ) {
        try {
          const approvalTx = await this.getApprovalTransaction({
            tokenAddress: params.src,
            chainId: params.chainId,
          });

          return {
            id: `inch_approval_${Date.now()}_${Math.random()
              .toString(36)
              .substring(7)}`,
            status: "needs_approval",
            phase: "approval",
            approvalTx: approvalTx,
            message: "Token approval required - insufficient allowance",
            timestamp: Date.now(),
            needsApproval: true,
            originalParams: params,
            error: (error as any).message,
            ...params,
          };
        } catch (approvalError) {
          console.error("Failed to get approval transaction:", approvalError);
        }
      }

      throw new Error(
        `Failed to create 1inch swap order: ${(error as any).message}`
      );
    }
  }

  // Execute a regular 1inch swap transaction
  async executeSwapTransaction(params: { swapData: any; userAddress: string }) {
    console.log("Executing 1inch swap transaction:", params);

    // Return the transaction data that needs to be sent to the blockchain
    // The frontend will handle the actual transaction submission
    return {
      txData: params.swapData.tx,
      status: "ready_for_execution",
      message: "Transaction ready - user needs to confirm in wallet",
      timestamp: Date.now(),
      requiresUserConfirmation: true,
    };
  }

  // Try to use Fusion+ but fallback to regular swap if it fails
  async createFusionOrder(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
    preset?: string;
  }) {
    console.log("Attempting Fusion+ order creation:", params);

    try {
      const sdk = await this.initializeFusionSDK(params.chainId);

      const orderParams = {
        fromTokenAddress: params.src,
        toTokenAddress: params.dst,
        amount: params.amount,
        walletAddress: params.from,
        source: "fusion-jar",
        preset: params.preset as any,
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
        message: "Fusion+ order created - ready for signing and submission",
        timestamp: Date.now(),
        isFusion: true,
        ...params,
      };
    } catch (error) {
      console.error(
        "Fusion+ failed, falling back to regular 1inch swap:",
        error
      );

      // Fallback to regular 1inch swap API
      const swapOrder = await this.createSwapOrder({
        ...params,
        slippage: 1, // 1% slippage for regular swaps
      });

      return {
        ...swapOrder,
        phase: "ready",
        isFusion: false,
        message: "Using regular 1inch swap (Fusion+ unavailable)",
        fallbackReason: "Fusion+ SDK error: " + (error as any).message,
      };
    }
  }

  // Submit Fusion+ order or execute regular swap
  async submitFusionOrder(params: {
    orderData: any;
    signature?: string;
    userAddress: string;
  }) {
    console.log("Submitting order:", params);

    // Check if this is a Fusion order or regular swap
    if (params.orderData.isFusion) {
      try {
        const sdk = await this.initializeFusionSDK(8453);
        const result = await sdk.submitOrder(
          params.orderData.order,
          params.orderData.quoteId
        );

        return {
          orderHash: result.orderHash,
          status: "submitted",
          phase: "announcement",
          message: "Fusion+ order submitted to Dutch auction",
          timestamp: Date.now(),
          isFusion: true,
        };
      } catch (error) {
        console.error("Fusion+ submission failed:", error);
        throw new Error(`Fusion+ submission failed: ${(error as any).message}`);
      }
    } else {
      // For regular swaps, return transaction data for user to execute
      return {
        orderHash: params.orderData.id,
        status: "ready_for_execution",
        phase: "execution",
        message: "Regular swap ready - please confirm transaction in wallet",
        txData: params.orderData.tx,
        timestamp: Date.now(),
        isFusion: false,
        requiresUserConfirmation: true,
      };
    }
  }

  // Monitor order status
  async getOrderStatus(orderHash: string, chainId: number = 8453) {
    console.log("Checking order status:", orderHash);

    // Check if this is a Fusion order
    if (orderHash.includes("fusion_order")) {
      try {
        const sdk = await this.initializeFusionSDK(chainId);
        const status = await sdk.getOrderStatus(orderHash);

        let phase = "announcement";
        let message = "Order in Dutch auction";

        switch (status.status) {
          case OrderStatus.Pending:
            phase = "announcement";
            message = "Order pending in Dutch auction";
            break;
          case OrderStatus.PartiallyFilled:
            phase = "deposit";
            message = "Resolver depositing assets to escrow";
            break;
          case OrderStatus.Filled:
            phase = "withdrawal";
            message = "Assets unlocked and swap completed";
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
        };
      } catch (error) {
        console.error("Error getting Fusion+ status:", error);
        throw new Error(
          `Failed to get Fusion+ status: ${(error as any).message}`
        );
      }
    } else {
      // For regular swaps, status depends on whether user has executed the transaction
      return {
        orderHash,
        status: "ready_for_execution",
        phase: "execution",
        message: "Waiting for user to confirm transaction",
        fills: [],
        timestamp: Date.now(),
        isFusion: false,
      };
    }
  }

  // Legacy methods for backward compatibility
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

  // Get transaction history for an address using the correct 1inch History API endpoint
  async getHistory(params: {
    address: string;
    chainId?: number;
    page?: number;
    limit?: number;
  }) {
    // Using the correct endpoint: /v2.0/history/{address}/events
    // Based on https://portal.1inch.dev/documentation/apis/history/swagger
    const queryParams = new URLSearchParams();

    if (params.chainId) {
      queryParams.append("chainId", params.chainId.toString());
    }
    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const url = `${INCH_API_BASE}/history/v2.0/history/${
      params.address
    }/events${queryParams.toString() ? `?${queryParams}` : ""}`;

    console.log("Getting 1inch history with params:", params);
    console.log("Calling 1inch History API:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("1inch History API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `1inch History API error: ${response.status} - ${response.statusText}`
      );
    }

    return response.json();
  }

  // Get token prices from multiple chains for portfolio calculation
  async getMultiChainPrices(
    tokenAddresses: string[],
    chainIds: number[] = [1, 137, 8453]
  ) {
    const prices: Record<string, number> = {};

    for (const chainId of chainIds) {
      for (const tokenAddress of tokenAddresses) {
        try {
          const priceData = await this.getTokenPrice({ tokenAddress, chainId });
          const key = `${chainId}-${tokenAddress.toLowerCase()}`;
          prices[key] = parseFloat(priceData[tokenAddress] || "0");
        } catch (error) {
          console.warn(
            `Failed to get price for ${tokenAddress} on chain ${chainId}:`,
            error
          );
          // Continue with other tokens
        }
      }
    }

    return prices;
  }

  // Get token prices using 1inch Spot Price API
  async getTokenPrice(params: { tokenAddress: string; chainId?: number }) {
    // Using Spot Price API: /v1.1/{chainId}/{tokenAddress}
    const chainId = params.chainId || 1; // Default to Ethereum
    const url = `${INCH_API_BASE}/price/v1.1/${chainId}/${params.tokenAddress}`;

    console.log("Getting 1inch token price with params:", params);
    console.log("Calling 1inch Spot Price API:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("1inch Spot Price API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `1inch Spot Price API error: ${response.status} - ${response.statusText}`
      );
    }

    return response.json();
  }

  async executeIntent(params: {
    intentId: string;
    signature: string;
    userAddress: string;
  }) {
    // Legacy compatibility - return transaction ready status
    return {
      txHash: null,
      status: "ready_for_execution",
      message: "Transaction ready for user confirmation",
      orderHash: params.intentId,
      timestamp: Date.now(),
      requiresUserConfirmation: true,
    };
  }
}

// Try different possible environment variable names for API key
const getApiKey = () => {
  const apiKey =
    process.env.INCH_API_KEY ||
    process.env.ONE_INCH_API_KEY ||
    process.env.ONEINCH_API_KEY;

  if (!apiKey) {
    console.error(
      "❌ No 1inch API key found. Please set INCH_API_KEY in your .env.local file"
    );
    throw new Error("1inch API key not configured");
  }

  console.log(`✅ 1inch API key loaded: ${apiKey.substring(0, 8)}...`);
  return apiKey;
};

export const oneInchAPI = new OneInchAPI(getApiKey());
