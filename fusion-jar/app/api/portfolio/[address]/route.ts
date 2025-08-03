import { NextRequest, NextResponse } from "next/server";
import { oneInchAPI } from "@/lib/1inch";
import { supabase } from "@/lib/supabase";

// Helper function to get total investment from investment_executions table
async function getTotalInvestment(address: string) {
  try {
    const { data, error } = await supabase
      .from("investment_executions")
      .select("amount_usd, status, executed_at")
      .eq("user_address", address.toLowerCase())
      .eq("status", "fulfilled");

    if (error) {
      console.error("Error fetching investment data:", error);
      return 0;
    }

    const totalInvestment =
      data?.reduce((sum, execution) => {
        return sum + parseFloat(execution.amount_usd || "0");
      }, 0) || 0;

    return totalInvestment;
  } catch (error) {
    console.error("Error calculating total investment:", error);
    return 0;
  }
}

// Helper function to get token balances and values across chains
async function getTokenValuesAcrossChains(address: string) {
  try {
    // Get all unique tokens from investment_executions for this user
    const { data: executions, error } = await supabase
      .from("investment_executions")
      .select("target_token, target_chain, actual_amount_out")
      .eq("user_address", address.toLowerCase())
      .eq("status", "fulfilled");

    if (error) {
      console.error("Error fetching execution data:", error);
      return { totalValue: 0, tokens: [] };
    }

    // Group tokens by chain and address
    const tokenBalances: Record<
      string,
      {
        address: string;
        chainId: number;
        balance: string;
        balanceUsd: number;
        price: number;
        symbol: string;
        name: string;
      }
    > = {};

    executions?.forEach((execution) => {
      const key = `${execution.target_chain}-${execution.target_token}`;
      if (!tokenBalances[key]) {
        tokenBalances[key] = {
          address: execution.target_token,
          chainId: execution.target_chain,
          balance: "0",
          balanceUsd: 0,
          price: 0,
          symbol: getTokenSymbolFromAddress(execution.target_token),
          name: getTokenNameFromAddress(execution.target_token),
        };
      }

      // Add to balance (assuming actual_amount_out is in wei/smallest unit)
      const amount = parseFloat(execution.actual_amount_out || "0");
      tokenBalances[key].balance = (
        parseFloat(tokenBalances[key].balance) + amount
      ).toString();
    });

    // Get prices for all tokens across chains
    const totalValue = await calculateTotalValue(
      tokenBalances,
      [1, 137, 8453, 42161, 10] // Ethereum, Polygon, Base, Arbitrum, Optimism
    );

    return {
      totalValue,
      tokens: Object.values(tokenBalances).filter(
        (token) => parseFloat(token.balance) > 0
      ),
    };
  } catch (error) {
    console.error("Error getting token values:", error);
    return { totalValue: 0, tokens: [] };
  }
}

// Helper function to calculate total value using 1inch price API
async function calculateTotalValue(
  tokenBalances: Record<
    string,
    {
      address: string;
      chainId: number;
      balance: string;
      balanceUsd: number;
      price: number;
      symbol: string;
      name: string;
    }
  >,
  chains: number[]
) {
  let totalValue = 0;

  for (const [, token] of Object.entries(tokenBalances)) {
    try {
      // Get price from 1inch API
      const priceData = await oneInchAPI.getTokenPrice({
        tokenAddress: token.address,
        chainId: token.chainId,
      });

      // Extract price from response
      const price = parseFloat(priceData[token.address] || "0");
      token.price = price;

      // Calculate USD value (assuming balance is in wei/smallest unit)
      const balanceInEth = parseFloat(token.balance) / Math.pow(10, 18); // Convert from wei
      const usdValue = balanceInEth * price;
      token.balanceUsd = usdValue;

      totalValue += usdValue;
    } catch (error) {
      console.warn(
        `Failed to get price for ${token.address} on chain ${token.chainId}:`,
        error
      );
      // Use fallback price of 1 for stablecoins
      if (token.symbol === "USDC" || token.symbol === "USDT") {
        token.price = 1;
        const balanceInEth = parseFloat(token.balance) / Math.pow(10, 6); // USDC has 6 decimals
        token.balanceUsd = balanceInEth;
        totalValue += balanceInEth;
      }
    }
  }

  return totalValue;
}

// Helper functions to get token info from address
function getTokenSymbolFromAddress(address: string): string {
  const tokenMap: Record<string, string> = {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "ETH",
    "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": "USDC",
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC",
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
    "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8": "USDC",
  };
  return tokenMap[address.toLowerCase()] || "UNKNOWN";
}

function getTokenNameFromAddress(address: string): string {
  const nameMap: Record<string, string> = {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USD Coin",
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "Wrapped Bitcoin",
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "Ethereum",
    "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": "USD Coin",
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USD Coin",
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "Tether USD",
    "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8": "USD Coin",
  };
  return nameMap[address.toLowerCase()] || "Unknown Token";
}

// Helper function to derive portfolio data from transaction history
function derivePortfolioFromHistory(
  historyData: {
    items?: Array<{
      timeMs?: number;
      details?: {
        tokenActions?: Array<{
          chainId?: number;
          address: string;
          amount?: string;
          direction?: string;
        }>;
      };
    }>;
  },
  address: string
) {
  if (!historyData?.items) {
    return {
      totalValue: 0,
      totalValueUsd: 0,
      dayChange: 0,
      dayChangePercent: 0,
      tokens: [],
      chartData: [],
    };
  }

  const tokens: Record<
    string,
    {
      address: string;
      symbol: string;
      name: string;
      balance: string;
      balanceUsd: number;
      price: number;
      chainId: number;
      totalIn: number;
      totalOut: number;
    }
  > = {};
  const chartData = [];

  // Analyze transactions to determine current holdings
  for (const item of historyData.items.slice(0, 50)) {
    // Analyze recent transactions
    if (item.details?.tokenActions) {
      for (const action of item.details.tokenActions) {
        const key = `${action.chainId || 1}-${action.address}`;

        if (!tokens[key]) {
          tokens[key] = {
            address: action.address,
            symbol: getTokenSymbolFromAddress(action.address),
            name: getTokenNameFromAddress(action.address),
            balance: "0",
            balanceUsd: 0,
            price: 0,
            chainId: action.chainId || 1,
            totalIn: 0,
            totalOut: 0,
          };
        }

        const amount = parseFloat(action.amount || "0");
        if (action.direction === "In") {
          tokens[key].totalIn += amount;
        } else if (action.direction === "Out") {
          tokens[key].totalOut += amount;
        }
      }
    }

    // Add to chart data (simplified)
    chartData.push({
      timestamp: item.timeMs || Date.now(),
      value: 1000 + Math.random() * 500, // Placeholder value
    });
  }

  // Calculate estimated balances
  const tokenArray = Object.values(tokens)
    .map((token) => ({
      ...token,
      balance: Math.max(0, token.totalIn - token.totalOut).toString(),
      balanceUsd: Math.max(0, token.totalIn - token.totalOut) * 1, // Simplified USD value
      price: 1, // Placeholder price
    }))
    .filter((token) => parseFloat(token.balance) > 0);

  const totalValue = tokenArray.reduce(
    (sum, token) => sum + token.balanceUsd,
    0
  );

  return {
    totalValue,
    totalValueUsd: totalValue,
    dayChange: totalValue * 0.02, // Placeholder 2% change
    dayChangePercent: 2.0,
    tokens: tokenArray,
    chartData: chartData.slice(-12), // Last 12 data points
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;

    const chainId = searchParams.get("chainId");

    console.log("Fetching portfolio for address:", address);

    // Get total investment from database
    const totalInvestment = await getTotalInvestment(address);
    console.log("Total investment from database:", totalInvestment);

    // Get token values across chains
    const { totalValue: valueAcrossChains, tokens: chainTokens } =
      await getTokenValuesAcrossChains(address);
    console.log("Value across chains:", valueAcrossChains);

    // For now, let's use the History API to get transaction data and derive portfolio info
    // This is more reliable than the Portfolio/Balance APIs that seem to be unavailable
    let historyData = null;

    try {
      historyData = await oneInchAPI.getHistory({
        address,
        chainId: chainId ? parseInt(chainId) : undefined,
        limit: 100, // Get more transactions for portfolio analysis
      });
      console.log("Successfully fetched history data for portfolio analysis");
    } catch (error) {
      console.error("History API failed:", error);
    }

    // Derive portfolio data from transaction history
    const transformedData = derivePortfolioFromHistory(historyData, address);

    // Combine database data with API data
    const combinedData = {
      ...transformedData,
      totalInvestment, // Add total investment from database
      valueAcrossChains, // Add value across chains
      chainTokens, // Add tokens from database
    };

    return NextResponse.json({
      success: true,
      data: combinedData,
    });
  } catch (error) {
    console.error("Portfolio API error:", error);

    // Return mock data as fallback for development
    const mockPortfolioData = {
      totalValue: 1385.5,
      totalValueUsd: 1385.5,
      totalInvestment: 1250.0, // Mock total investment
      valueAcrossChains: 1385.5, // Mock value across chains
      dayChange: 42.3,
      dayChangePercent: 3.15,
      tokens: [
        {
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          symbol: "USDC",
          name: "USD Coin",
          balance: "500.00",
          balanceUsd: 500.0,
          price: 1.0,
          chainId: 1,
        },
        {
          address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
          symbol: "WBTC",
          name: "Wrapped Bitcoin",
          balance: "0.02",
          balanceUsd: 885.5,
          price: 44275.0,
          chainId: 1,
        },
      ],
      chainTokens: [], // Mock chain tokens
      chartData: [
        { timestamp: Date.now() - 11 * 24 * 60 * 60 * 1000, value: 1250 },
        { timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, value: 1260 },
        { timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000, value: 1280 },
        { timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, value: 1275 },
        { timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, value: 1300 },
        { timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, value: 1310 },
        { timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, value: 1330 },
        { timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, value: 1320 },
        { timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, value: 1340 },
        { timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, value: 1355 },
        { timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, value: 1370 },
        { timestamp: Date.now(), value: 1385.5 },
      ],
    };

    return NextResponse.json({
      success: true,
      data: mockPortfolioData,
      fallback: true,
      message: "Using mock data - 1inch Portfolio API unavailable",
    });
  }
}
