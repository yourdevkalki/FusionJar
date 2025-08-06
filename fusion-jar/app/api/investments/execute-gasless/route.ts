import { NextRequest, NextResponse } from "next/server";
import { oneInchAPI } from "@/lib/1inch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields for Fusion+ order submission
    if (!body.orderData || !body.signature || !body.userAddress) {
      return NextResponse.json(
        { error: "Missing required fields: orderData, signature, userAddress" },
        { status: 400 }
      );
    }

    console.log("Submitting Fusion+ order to Dutch auction:", {
      userAddress: body.userAddress,
      signature: body.signature.substring(0, 10) + "...",
      orderData: body.orderData ? "Present" : "Missing",
    });

    // Verify signature format
    if (!body.signature || body.signature.length < 130) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid signature format",
          phase: "announcement",
        },
        { status: 400 }
      );
    }

    // Submit the Fusion+ order to start the Dutch auction
    const result = await oneInchAPI.submitFusionOrder({
      orderData: body.orderData,
      signature: body.signature,
      userAddress: body.userAddress,
    });

    return NextResponse.json({
      success: true,
      orderHash: result.orderHash,
      phase: result.phase,
      message: result.message,
      status: result.status,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("Submit Fusion+ order error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit Fusion+ order",
        details: error instanceof Error ? error.message : "Unknown error",
        phase: "announcement",
      },
      { status: 500 }
    );
  }
}
