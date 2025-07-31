import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order, quoteId } = body;

    // Validate required parameters
    if (!order) {
      return NextResponse.json(
        { error: "Missing required parameter: order" },
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

    // For now, we'll simulate order submission since the actual Fusion API
    // might require different parameters or a different endpoint
    console.log("Simulating order submission with:", { order, quoteId });

    // Simulate successful order submission
    // Generate a proper 66-character order hash (32 bytes + "0x" prefix)
    const orderHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    const submissionResult = {
      orderHash: orderHash,
      status: "submitted",
      message: "Order submitted successfully (simulated)",
    };

    return NextResponse.json(submissionResult);
  } catch (error) {
    console.error("Fusion order submission API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
