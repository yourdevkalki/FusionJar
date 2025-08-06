import { NextRequest, NextResponse } from "next/server";
import { oneInchAPI } from "@/lib/1inch";
import { requireAuth } from "@/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const authenticatedAddress = requireAuth(request);

    // Ensure user can only access their own balance data
    if (address.toLowerCase() !== authenticatedAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chainId = parseInt(searchParams.get("chainId") || "1");

    console.log(`Fetching balances for ${address} on chain ${chainId}`);

    // Get wallet balances from 1inch Balance API
    const balances = await oneInchAPI.getWalletBalances(address, chainId);

    return NextResponse.json({
      success: true,
      balances,
      chainId,
      address,
    });
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch wallet balances",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}