import { NextRequest, NextResponse } from "next/server";
import { oneInchAPI } from "@/lib/1inch";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    const chainId = searchParams.get("chainId");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    console.log("Fetching history for address:", address);

    // Get transaction history from 1inch
    const historyData = await oneInchAPI.getHistory({
      address,
      chainId: chainId ? parseInt(chainId) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });

    // Transform 1inch API response to match our frontend expectations
    const transformedData = {
      transactions: historyData.items?.map((item: any) => ({
        txHash: item.details?.txHash || "",
        blockNumber: item.details?.blockNumber || 0,
        timeStamp: Math.floor((item.timeMs || 0) / 1000).toString(), // Convert ms to seconds
        from: item.address || "",
        to: item.details?.toAddress || "",
        value: "0", // 1inch API doesn't provide ETH value in same format
        status: item.details?.status === "completed" ? "1" : "0",
        srcToken: item.details?.tokenActions?.[0] ? {
          symbol: "Unknown", // 1inch API structure is different
          name: "Unknown Token",
          decimals: 18,
          address: item.details.tokenActions[0].address || ""
        } : undefined,
        dstToken: item.details?.tokenActions?.[1] ? {
          symbol: "Unknown",
          name: "Unknown Token", 
          decimals: 18,
          address: item.details.tokenActions[1].address || ""
        } : undefined,
        srcAmount: item.details?.tokenActions?.[0]?.amount || "0",
        dstAmount: item.details?.tokenActions?.[1]?.amount || "0",
        chainId: item.details?.chainId || 1,
        gas: "0",
        gasPrice: "0",
        gasUsed: "0"
      })) || [],
      total: historyData.items?.length || 0,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });

  } catch (error) {
    console.error("History API error:", error);
    
    // Return mock data as fallback for development
    const mockHistoryData = {
      transactions: [
        {
          txHash: "0x1234567890abcdef...",
          blockNumber: 18500000,
          timeStamp: Math.floor(Date.now() / 1000).toString(),
          from: address,
          to: "0x1111111254eeb25477b68fb85ed929f73a960582",
          value: "50000000", // 0.05 ETH in wei
          status: "1",
          srcToken: {
            symbol: "ETH",
            name: "Ethereum",
            decimals: 18,
            address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          },
          dstToken: {
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
          },
          srcAmount: "50000000000000000", // 0.05 ETH
          dstAmount: "150000000", // 150 USDC
          chainId: 1,
          gas: "21000",
          gasPrice: "20000000000",
          gasUsed: "21000",
          nonce: "1",
          blockHash: "0xabcdef...",
          cumulativeGasUsed: "21000",
          input: "0x",
          confirmations: "100"
        },
        {
          txHash: "0xabcdef1234567890...",
          blockNumber: 18499950,
          timeStamp: (Math.floor(Date.now() / 1000) - 3600).toString(),
          from: address,
          to: "0x1111111254eeb25477b68fb85ed929f73a960582",
          value: "0",
          status: "0", // Failed transaction
          srcToken: {
            symbol: "USDC",
            name: "USD Coin", 
            decimals: 6,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
          },
          dstToken: {
            symbol: "WBTC",
            name: "Wrapped Bitcoin",
            decimals: 8,
            address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
          },
          srcAmount: "100000000", // 100 USDC
          dstAmount: "0", // Failed
          chainId: 1,
          gas: "150000",
          gasPrice: "25000000000",
          gasUsed: "0",
          nonce: "2",
          blockHash: "0x123456...",
          cumulativeGasUsed: "0",
          input: "0x",
          confirmations: "99"
        }
      ],
      total: 2,
      page: 1,
      limit: 50
    };

    return NextResponse.json({
      success: true,
      data: mockHistoryData,
      fallback: true,
      message: "Using mock data - 1inch History API unavailable"
    });
  }
}