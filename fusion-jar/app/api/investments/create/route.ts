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
    if (
      body.frequency === "custom" &&
      (!body.customDays || body.customDays <= 0)
    ) {
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

    // Use wallet address from request body if provided, otherwise use authenticated address
    const walletAddress = body.walletAddress || userAddress;

    console.log("🔍 Debug - Creating jar with addresses:");
    console.log("  - userAddress (from auth):", userAddress);
    console.log("  - walletAddress (from body):", body.walletAddress);
    console.log("  - final walletAddress:", walletAddress);

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
    // Since amount is already in USD, use it directly
    const amountUsd = body.amount;

    const { data: investmentIntent, error: dbError } = await supabase
      .from("investment_intents")
      .insert({
        user_address: walletAddress.toLowerCase(), // Always store in lowercase
        source_token: body.sourceToken,
        source_chain: body.sourceChain,
        target_token: body.targetToken,
        target_chain: body.targetChain,
        amount: body.amount,
        amount_unit: "USD", // Always USD since we're investing USD
        amount_usd: amountUsd,
        frequency: frequencyValue,
        interval_days: intervalDays,
        start_date: body.startDate,
        jar_name: body.jarName,
        save_as_template: body.saveAsTemplate || false,
        gas_limit: body.gasLimit,
        min_slippage: body.minSlippage,
        deadline_minutes: body.deadline,
        stop_after_swaps: body.stopAfterSwaps,
        fee_tolerance: body.minSlippage || 0.01, // Use minSlippage as fee tolerance
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
        // For USD investments, we need to convert to USDC amount
        // Assuming 1 USD = 1 USDC (stablecoin)
        const usdcAmount = (body.amount * 1e6).toString(); // USDC has 6 decimals

        // Use USDC address based on chain
        const usdcAddress =
          body.sourceChain === 1
            ? "0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C" // Ethereum USDC (placeholder)
            : body.sourceChain === 137
            ? "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" // Polygon USDC
            : body.sourceChain === 56
            ? "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" // BSC USDC
            : body.sourceChain === 8453
            ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base USDC
            : "0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C"; // Default

        const quote = await oneInchAPI.getQuote({
          src: usdcAddress,
          dst: body.targetToken,
          amount: usdcAmount,
          from: walletAddress,
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
