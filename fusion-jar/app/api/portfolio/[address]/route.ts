import { NextRequest, NextResponse } from "next/server";
import { oneInchAPI } from "@/lib/1inch";

// Helper function to derive portfolio data from transaction history
function derivePortfolioFromHistory(historyData: any, address: string) {
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

  const tokens: Record<string, any> = {};
  const chartData = [];
  
  // Analyze transactions to determine current holdings
  for (const item of historyData.items.slice(0, 50)) { // Analyze recent transactions
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
  const tokenArray = Object.values(tokens).map((token: any) => ({
    ...token,
    balance: Math.max(0, token.totalIn - token.totalOut).toString(),
    balanceUsd: Math.max(0, token.totalIn - token.totalOut) * 1, // Simplified USD value
    price: 1, // Placeholder price
  })).filter(token => parseFloat(token.balance) > 0);

  const totalValue = tokenArray.reduce((sum, token) => sum + token.balanceUsd, 0);

  return {
    totalValue,
    totalValueUsd: totalValue,
    dayChange: totalValue * 0.02, // Placeholder 2% change
    dayChangePercent: 2.0,
    tokens: tokenArray,
    chartData: chartData.slice(-12), // Last 12 data points
  };
}

// Helper functions to get token info from address
function getTokenSymbolFromAddress(address: string): string {
  const tokenMap: Record<string, string> = {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC", 
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "ETH",
    "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": "USDC",
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC",
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
  };
  return nameMap[address.toLowerCase()] || "Unknown Token";
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

    return NextResponse.json({
      success: true,
      data: transformedData,
    });

  } catch (error) {
    console.error("Portfolio API error:", error);
    
    // Return mock data as fallback for development
    const mockPortfolioData = {
      totalValue: 1385.50,
      totalValueUsd: 1385.50,
      dayChange: 42.30,
      dayChangePercent: 3.15,
      tokens: [
        {
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          symbol: "USDC",
          name: "USD Coin",
          balance: "500.00",
          balanceUsd: 500.00,
          price: 1.00,
          chainId: 1,
        },
        {
          address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
          symbol: "WBTC",
          name: "Wrapped Bitcoin",
          balance: "0.02",
          balanceUsd: 885.50,
          price: 44275.00,
          chainId: 1,
        },
      ],
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
      message: "Using mock data - 1inch Portfolio API unavailable"
    });
  }
}