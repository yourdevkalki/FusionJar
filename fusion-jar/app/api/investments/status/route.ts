import { NextRequest, NextResponse } from "next/server";
import { oneInchAPI } from "@/lib/1inch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderHash = searchParams.get("orderHash");
    const chainId = parseInt(searchParams.get("chainId") || "8453");

    if (!orderHash) {
      return NextResponse.json(
        { error: "Missing required parameter: orderHash" },
        { status: 400 }
      );
    }

    console.log("Checking Fusion+ order status:", { orderHash, chainId });

    // Get order status through all phases
    const status = await oneInchAPI.getOrderStatus(orderHash, chainId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Get order status error:", error);
    return NextResponse.json(
      {
        error: "Failed to get order status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.orderHash) {
      return NextResponse.json(
        { error: "Missing required field: orderHash" },
        { status: 400 }
      );
    }

    const chainId = body.chainId || 8453;

    console.log("Checking Fusion+ order status via POST:", {
      orderHash: body.orderHash,
      chainId,
    });

    // Get order status through all phases
    const status = await oneInchAPI.getOrderStatus(body.orderHash, chainId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Get order status error:", error);
    return NextResponse.json(
      {
        error: "Failed to get order status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
