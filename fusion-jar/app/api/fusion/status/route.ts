import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderHash = searchParams.get("orderHash");

    // Validate required parameters
    if (!orderHash) {
      return NextResponse.json(
        { error: "Missing required parameter: orderHash" },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.ONE_INCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // For now, we'll simulate order status checking
    console.log('Checking order status for:', orderHash);
    
    // Simulate order status - randomly return different statuses for demo
    const statuses = ["Pending", "Processing", "Filled", "Expired", "Cancelled"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const statusData = {
      orderHash: orderHash,
      status: randomStatus,
      fills: randomStatus === "Filled" ? [
        {
          amount: "100000",
          fee: "0",
          timestamp: Date.now()
        }
      ] : [],
      message: `Order status: ${randomStatus}`,
    };

    return NextResponse.json(statusData);
  } catch (error) {
    console.error("Fusion order status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
