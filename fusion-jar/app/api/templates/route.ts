import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/utils/auth";

// Get user's saved templates
export async function GET(request: NextRequest) {
  try {
    const userAddress = requireAuth(request);

    const { data: templates, error } = await supabase
      .from("investment_templates")
      .select("*")
      .eq("user_address", userAddress)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Templates fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
    });
  } catch (error) {
    console.error("Templates GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Save a new template
export async function POST(request: NextRequest) {
  try {
    const userAddress = requireAuth(request);
    const templateData = await request.json();

    const { data: template, error } = await supabase
      .from("investment_templates")
      .insert({
        user_address: userAddress,
        template_name: templateData.templateName,
        source_token: templateData.sourceToken,
        source_chain: templateData.sourceChain,
        target_token: templateData.targetToken,
        target_chain: templateData.targetChain,
        amount: templateData.amount,
        amount_unit: templateData.amountUnit,
        frequency: templateData.frequency,
        interval_days: templateData.intervalDays || 1,
        gas_limit: templateData.gasLimit,
        min_slippage: templateData.minSlippage,
        deadline_minutes: templateData.deadline,
        stop_after_swaps: templateData.stopAfterSwaps,
      })
      .select()
      .single();

    if (error) {
      console.error("Template save error:", error);
      return NextResponse.json(
        { error: "Failed to save template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
      message: "Template saved successfully",
    });
  } catch (error) {
    console.error("Templates POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}