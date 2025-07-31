import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromTokenAddress, toTokenAddress, amount, walletAddress, source } =
      body;

    // Validate required parameters
    if (!fromTokenAddress || !toTokenAddress || !amount || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required parameters" },
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

    // Build the 1inch API URL
    const url = `https://api.1inch.dev/fusion/quoter/v2.0/8453/quote/receive/?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}&walletAddress=${walletAddress}&source=${
      source || "fusion-ui-demo"
    }&surplus=true`;

    // Make request to 1inch API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("1inch API error:", errorData);
      return NextResponse.json(
        {
          error: errorData.description || "Failed to get quote from 1inch API",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fusion quote API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
