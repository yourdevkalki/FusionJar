import { NextRequest, NextResponse } from "next/server";
import { oneInchAPI } from "@/lib/1inch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.src || !body.dst || !body.amount || !body.from || !body.chainId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get quote from 1inch
    const quote = await oneInchAPI.getQuote({
      src: body.src,
      dst: body.dst,
      amount: body.amount,
      from: body.from,
      chainId: body.chainId,
    });

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error("Quote error:", error);
    return NextResponse.json({ error: "Failed to get quote" }, { status: 500 });
  }
}
