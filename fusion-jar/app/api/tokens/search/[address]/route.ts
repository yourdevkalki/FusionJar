import { NextRequest, NextResponse } from "next/server";
import { TOKENS, SUPPORTED_CHAINS } from "@/lib/tokens";
import { TokenSearchResult } from "@/types/investment";

// 1inch API configuration
const ONEINCH_API_KEY =
  process.env.ONEINCH_API_KEY || "OJirsGx8kPk93jqcoUbE9ND2thpG8UmY";
const ONEINCH_BASE_URL = "https://api.1inch.dev";

// Address validation regexes
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Validate address format (Ethereum or Solana)
    const isEthAddress = ETH_ADDRESS_REGEX.test(address);
    const isSolanaAddress = SOLANA_ADDRESS_REGEX.test(address);

    if (!isEthAddress && !isSolanaAddress) {
      return NextResponse.json(
        {
          error:
            "Invalid address format. Must be a valid Ethereum (0x...) or Solana address",
        },
        { status: 400 }
      );
    }

    // Check if token exists in our predefined list
    const existingToken = TOKENS.find((token) =>
      isEthAddress
        ? token.address.toLowerCase() === address.toLowerCase()
        : token.address === address
    );

    if (existingToken) {
      // Build chain compatibility info
      const chainCompatibility = SUPPORTED_CHAINS.map((chain) => ({
        chainId: chain.id,
        chainName: chain.name,
        supported: TOKENS.some(
          (t) =>
            (isEthAddress
              ? t.address.toLowerCase() === address.toLowerCase()
              : t.address === address) && t.chainId === chain.id
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

    // Try to fetch token data from 1inch API for EVM chains
    if (isEthAddress) {
      try {
        // Try Ethereum first
        const ethResponse = await fetch(
          `${ONEINCH_BASE_URL}/token/v1.3/1/custom/${address}`,
          {
            headers: {
              Authorization: `Bearer ${ONEINCH_API_KEY}`,
            },
          }
        );

        if (ethResponse.ok) {
          const ethData = await ethResponse.json();
          const result: TokenSearchResult = {
            address: ethData.address,
            symbol: ethData.symbol,
            name: ethData.name,
            decimals: ethData.decimals,
            chainCompatibility: [
              { chainId: 1, chainName: "Ethereum", supported: true },
              { chainId: 137, chainName: "Polygon", supported: false },
              { chainId: 56, chainName: "BNB Smart Chain", supported: false },
              { chainId: 101, chainName: "Solana", supported: false },
            ],
          };

          return NextResponse.json({
            success: true,
            token: result,
          });
        }

        // Try Polygon if Ethereum fails
        const polygonResponse = await fetch(
          `${ONEINCH_BASE_URL}/token/v1.3/137/custom/${address}`,
          {
            headers: {
              Authorization: `Bearer ${ONEINCH_API_KEY}`,
            },
          }
        );

        if (polygonResponse.ok) {
          const polygonData = await polygonResponse.json();
          const result: TokenSearchResult = {
            address: polygonData.address,
            symbol: polygonData.symbol,
            name: polygonData.name,
            decimals: polygonData.decimals,
            chainCompatibility: [
              { chainId: 1, chainName: "Ethereum", supported: false },
              { chainId: 137, chainName: "Polygon", supported: true },
              { chainId: 56, chainName: "BNB Smart Chain", supported: false },
              { chainId: 101, chainName: "Solana", supported: false },
            ],
          };

          return NextResponse.json({
            success: true,
            token: result,
          });
        }

        // Try BSC if Polygon fails
        const bscResponse = await fetch(
          `${ONEINCH_BASE_URL}/token/v1.3/56/custom/${address}`,
          {
            headers: {
              Authorization: `Bearer ${ONEINCH_API_KEY}`,
            },
          }
        );

        if (bscResponse.ok) {
          const bscData = await bscResponse.json();
          const result: TokenSearchResult = {
            address: bscData.address,
            symbol: bscData.symbol,
            name: bscData.name,
            decimals: bscData.decimals,
            chainCompatibility: [
              { chainId: 1, chainName: "Ethereum", supported: false },
              { chainId: 137, chainName: "Polygon", supported: false },
              { chainId: 56, chainName: "BNB Smart Chain", supported: true },
              { chainId: 101, chainName: "Solana", supported: false },
            ],
          };

          return NextResponse.json({
            success: true,
            token: result,
          });
        }

        // Try Base if BSC fails
        const baseResponse = await fetch(
          `${ONEINCH_BASE_URL}/token/v1.3/8453/custom/${address}`,
          {
            headers: {
              Authorization: `Bearer ${ONEINCH_API_KEY}`,
            },
          }
        );

        if (baseResponse.ok) {
          const baseData = await baseResponse.json();
          const result: TokenSearchResult = {
            address: baseData.address,
            symbol: baseData.symbol,
            name: baseData.name,
            decimals: baseData.decimals,
            chainCompatibility: [
              { chainId: 1, chainName: "Ethereum", supported: false },
              { chainId: 137, chainName: "Polygon", supported: false },
              { chainId: 56, chainName: "BNB Smart Chain", supported: false },
              { chainId: 101, chainName: "Solana", supported: false },
              { chainId: 8453, chainName: "Base", supported: true },
            ],
          };

          return NextResponse.json({
            success: true,
            token: result,
          });
        }
      } catch (error) {
        console.error("1inch API error:", error);
      }
    }

    // For Solana tokens, we'll use a fallback approach since 1inch doesn't support Solana
    if (isSolanaAddress) {
      // For now, return a generic Solana token response
      // In a real implementation, you would integrate with Solana RPC or Jupiter API
      const result: TokenSearchResult = {
        address: address,
        symbol: "UNKNOWN",
        name: "Unknown Solana Token",
        decimals: 9, // Default for most Solana tokens
        chainCompatibility: [
          { chainId: 1, chainName: "Ethereum", supported: false },
          { chainId: 137, chainName: "Polygon", supported: false },
          { chainId: 56, chainName: "BNB Smart Chain", supported: false },
          { chainId: 101, chainName: "Solana", supported: true },
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
