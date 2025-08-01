import { NextRequest, NextResponse } from "next/server";

// Basic token validation endpoint
export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    // Basic validation
    const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
    
    if (!address) {
      return NextResponse.json(
        { valid: false, error: "Address is required" },
        { status: 400 }
      );
    }

    if (!ETH_ADDRESS_REGEX.test(address)) {
      return NextResponse.json({
        valid: false,
        error: "Invalid address format"
      });
    }

    // For demo purposes, consider some addresses as valid
    const KNOWN_VALID_ADDRESSES = [
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", // UNI
      "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8c", // USDC
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    ];

    const isKnownValid = KNOWN_VALID_ADDRESSES.includes(address.toLowerCase());

    return NextResponse.json({
      valid: isKnownValid,
      message: isKnownValid ? "Valid token address" : "Token not found or not supported"
    });

  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate token" },
      { status: 500 }
    );
  }
}