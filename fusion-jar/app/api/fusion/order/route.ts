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

    // For Fusion SDK, order creation requires a quote first
    // We need to get a quote and then create the order from that quote
    const quoteUrl = `https://api.1inch.dev/fusion/quoter/v2.0/8453/quote/receive/?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}&walletAddress=${walletAddress}&source=${source || "fusion-ui-demo"}&surplus=true`;

    console.log('Getting quote for order creation:', quoteUrl);

    // First get the quote
    const quoteResponse = await fetch(quoteUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!quoteResponse.ok) {
      const errorData = await quoteResponse.json().catch(() => ({}));
      console.error('Failed to get quote for order creation:', errorData);
      return NextResponse.json(
        {
          error: errorData.description || "Failed to get quote for order creation",
        },
        { status: quoteResponse.status }
      );
    }

    const quoteData = await quoteResponse.json();
    console.log('Quote data for order creation:', quoteData);

    // Now create the order using the quote data
    // The Fusion SDK createOrder method likely uses the quote data internally
    // For now, we'll return the quote data with order creation instructions
    const orderData = {
      quote: quoteData,
      order: {
        quoteId: quoteData.quoteId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        walletAddress,
        source: source || "fusion-ui-demo",
        // Additional order parameters would be added here based on the quote
      },
      quoteId: quoteData.quoteId,
    };

    return NextResponse.json(orderData);
  } catch (error) {
    console.error("Fusion order creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
