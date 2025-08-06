import { NextRequest, NextResponse } from "next/server";
import { oneInchAPI } from "@/lib/1inch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields for Fusion+ order creation
    if (!body.src || !body.dst || !body.amount || !body.from || !body.chainId) {
      return NextResponse.json(
        { error: "Missing required fields: src, dst, amount, from, chainId" },
        { status: 400 }
      );
    }

    console.log("Creating Fusion+ order (Phase 1 - Announcement):", {
      src: body.src,
      dst: body.dst,
      amount: body.amount,
      from: body.from,
      chainId: body.chainId,
      preset: body.preset,
    });

    // Phase 1: Create Fusion+ order for announcement
    const fusionOrder = await oneInchAPI.createFusionOrder({
      src: body.src,
      dst: body.dst,
      amount: body.amount,
      from: body.from,
      chainId: body.chainId,
      preset: body.preset || "auto", // Default to auto preset
    });

    return NextResponse.json({
      success: true,
      phase: "announcement",
      message: "Fusion+ order created - ready for signing and Dutch auction",
      fusionOrder,
    });
  } catch (error) {
    console.error("Create Fusion+ order error:", error);
    return NextResponse.json(
      {
        error: "Failed to create Fusion+ order",
        details: error instanceof Error ? error.message : "Unknown error",
        phase: "announcement",
      },
      { status: 500 }
    );
  }
}
