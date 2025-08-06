import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    const chainId = searchParams.get("chainId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log("Fetching investment execution history for address:", address);

    // Build the query
    let query = supabase
      .from("investment_executions")
      .select(`
        id,
        intent_id,
        user_address,
        source_token,
        source_chain,
        target_token,
        target_chain,
        amount_usd,
        actual_amount_in,
        actual_amount_out,
        fee_paid,
        resolver_address,
        transaction_hash,
        status,
        executed_at,
        created_at
      `)
      .eq("user_address", address)
      .order("created_at", { ascending: false });

    // Apply filters
    if (chainId) {
      query = query.or(`source_chain.eq.${chainId},target_chain.eq.${chainId}`);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: executions, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    // Get recent investment executions for the summary
    const { data: recentInvestments } = await supabase
      .from("investment_executions")
      .select("*")
      .eq("user_address", address)
      .order("created_at", { ascending: false })
      .limit(5);

    // Transform investment execution data to match our frontend expectations
    const transformedData = {
      executions: executions || [],
      recentInvestments: recentInvestments || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });

  } catch (error) {
    console.error("Investment execution history API error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch investment execution history",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}