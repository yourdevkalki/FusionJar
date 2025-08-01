import { NextRequest, NextResponse } from "next/server";
import { TOKENS, SUPPORTED_CHAINS } from "@/lib/tokens";
import { TokenSearchResult } from "@/types/investment";

// Basic token validation regex
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    // Validate address format
    if (!ETH_ADDRESS_REGEX.test(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    // Check if token exists in our predefined list
    const existingToken = TOKENS.find(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );

    if (existingToken) {
      // Build chain compatibility info
      const chainCompatibility = SUPPORTED_CHAINS.map((chain) => ({
        chainId: chain.id,
        chainName: chain.name,
        supported: TOKENS.some(
          (t) =>
            t.address.toLowerCase() === address.toLowerCase() &&
            t.chainId === chain.id
        ),
      }));

      const result: TokenSearchResult = {
        address: existingToken.address,
        symbol: existingToken.symbol,
        name: existingToken.name,
        decimals: existingToken.decimals,
        chainCompatibility,
      };

      return NextResponse.json({
        success: true,
        token: result,
      });
    }

    // For demo purposes, simulate token lookup for unknown addresses
    // In a real implementation, you would query external APIs like:
    // - Ethereum: Etherscan API, Moralis, or direct contract call
    // - Polygon: PolygonScan API
    // - BSC: BscScan API
    
    // Simulate a successful token lookup
    if (address.toLowerCase() === "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984") {
      // Uniswap token example
      const result: TokenSearchResult = {
        address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        symbol: "UNI",
        name: "Uniswap",
        decimals: 18,
        chainCompatibility: [
          { chainId: 1, chainName: "Ethereum", supported: true },
          { chainId: 137, chainName: "Polygon", supported: true },
          { chainId: 56, chainName: "BNB Smart Chain", supported: false },
        ],
      };

      return NextResponse.json({
        success: true,
        token: result,
      });
    }

    // Token not found
    return NextResponse.json(
      { error: "Token not found or not supported" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Token search error:", error);
    return NextResponse.json(
      { error: "Failed to search token" },
      { status: 500 }
    );
  }
}