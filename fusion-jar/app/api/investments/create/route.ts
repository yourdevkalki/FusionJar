import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { oneInchAPI } from "@/lib/1inch";
import { CreateInvestmentFormData } from "@/types/investment";
import { requireAuth } from "@/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const body: CreateInvestmentFormData = await request.json();

    // Validate required fields
    if (
      !body.sourceToken ||
      !body.targetToken ||
      !body.amountUsd ||
      !body.frequency
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount range ($1-$10)
    if (body.amountUsd < 1 || body.amountUsd > 10) {
      return NextResponse.json(
        { error: "Amount must be between $1 and $10" },
        { status: 400 }
      );
    }

    // Get authenticated user address
    const userAddress = requireAuth(request);

    // Create investment intent in database
    const { data: investmentIntent, error: dbError } = await supabase
      .from("investment_intents")
      .insert({
        user_address: userAddress,
        source_token: body.sourceToken,
        source_chain: body.sourceChain,
        target_token: body.targetToken,
        target_chain: body.targetChain,
        amount_usd: body.amountUsd,
        frequency: body.frequency,
        fee_tolerance: body.feeTolerance,
        status: "active",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create investment intent" },
        { status: 500 }
      );
    }

    // Get quote from 1inch (for display purposes)
    try {
      const quote = await oneInchAPI.getQuote({
        src: body.sourceToken,
        dst: body.targetToken,
        amount: (body.amountUsd * 1e6).toString(), // Convert to smallest unit
        from: userAddress,
        chainId: body.sourceChain,
      });

      return NextResponse.json({
        success: true,
        investmentIntent,
        quote,
        message: "Investment intent created successfully",
      });
    } catch (quoteError) {
      console.error("Quote error:", quoteError);
      // Still return success for investment creation, but without quote
      return NextResponse.json({
        success: true,
        investmentIntent,
        message: "Investment intent created successfully (quote unavailable)",
      });
    }
  } catch (error) {
    console.error("Create investment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
