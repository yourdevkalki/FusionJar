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
      !body.amount ||
      !body.frequency ||
      !body.jarName ||
      !body.startDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount (positive number)
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate custom frequency
    if (body.frequency === "custom" && (!body.customDays || body.customDays <= 0)) {
      return NextResponse.json(
        { error: "Custom frequency requires valid number of days" },
        { status: 400 }
      );
    }

    // Validate start date (not in the past)
    const startDate = new Date(body.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return NextResponse.json(
        { error: "Start date cannot be in the past" },
        { status: 400 }
      );
    }

    // Get authenticated user address
    const userAddress = requireAuth(request);

    // Prepare frequency data
    let frequencyValue = body.frequency;
    let intervalDays = 1;
    
    switch (body.frequency) {
      case "daily":
        intervalDays = 1;
        break;
      case "weekly":
        intervalDays = 7;
        break;
      case "monthly":
        intervalDays = 30;
        break;
      case "custom":
        intervalDays = body.customDays || 1;
        frequencyValue = "custom";
        break;
    }

    // Create investment intent in database
    // Calculate amount_usd for backward compatibility (rough estimate)
    const estimatedAmountUsd = body.amount * (body.amountUnit === 'USDC' || body.amountUnit === 'USDT' ? 1 : 
                               body.amountUnit === 'ETH' ? 3000 : 
                               body.amountUnit === 'BTC' ? 50000 : 
                               body.amountUnit === 'WBTC' ? 50000 : 
                               100); // default estimate

    const { data: investmentIntent, error: dbError } = await supabase
      .from("investment_intents")
      .insert({
        user_address: userAddress,
        source_token: body.sourceToken,
        source_chain: body.sourceChain,
        target_token: body.targetToken,
        target_chain: body.targetChain,
        amount: body.amount,
        amount_unit: body.amountUnit,
        amount_usd: estimatedAmountUsd, // Add this for backward compatibility
        frequency: frequencyValue,
        interval_days: intervalDays,
        start_date: body.startDate,
        jar_name: body.jarName,
        save_as_template: body.saveAsTemplate || false,
        gas_limit: body.gasLimit,
        min_slippage: body.minSlippage,
        deadline_minutes: body.deadline,
        stop_after_swaps: body.stopAfterSwaps,
        fee_tolerance: 0.01, // Add default fee tolerance (1%)
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
    // Note: 1inch only works for same-chain swaps, not cross-chain
    try {
      // Only get quote if source and target are on the same chain
      if (body.sourceChain === body.targetChain) {
        const quote = await oneInchAPI.getQuote({
          src: body.sourceToken,
          dst: body.targetToken,
          amount: (body.amount * 1e6).toString(), // USDC has 6 decimals, not 18
          from: userAddress,
          chainId: body.sourceChain,
        });

        return NextResponse.json({
          success: true,
          investmentIntent,
          quote,
          message: "Investment intent created successfully",
        });
      } else {
        // Cross-chain swap - skip quote for now
        return NextResponse.json({
          success: true,
          investmentIntent,
          message: "Investment intent created successfully (cross-chain swap)",
        });
      }
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
