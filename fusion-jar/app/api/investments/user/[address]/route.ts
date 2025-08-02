import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const authenticatedAddress = requireAuth(request);

    console.log("🔍 Debug - Requested address:", address);
    console.log("🔍 Debug - Authenticated address:", authenticatedAddress);

    // Ensure user can only access their own data
    if (address.toLowerCase() !== authenticatedAddress.toLowerCase()) {
      console.log(
        "❌ Address mismatch - Requested:",
        address.toLowerCase(),
        "Authenticated:",
        authenticatedAddress.toLowerCase()
      );
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Try both addresses to see which one has data
    // Try to find intents with case-insensitive matching
    const { data: investmentIntents, error } = await supabase
      .from("investment_intents")
      .select("*")
      .ilike("user_address", address.toLowerCase())
      .order("created_at", { ascending: false });

    // If no results with lowercase, try with the original case
    if (!investmentIntents || investmentIntents.length === 0) {
      console.log("🔍 Debug - No results with lowercase, trying original case");
      const { data: altIntents, error: altError } = await supabase
        .from("investment_intents")
        .select("*")
        .ilike("user_address", address)
        .order("created_at", { ascending: false });

      if (altIntents && altIntents.length > 0) {
        console.log(
          "🔍 Debug - Found intents with original case:",
          altIntents.length
        );
        return NextResponse.json({
          success: true,
          data: altIntents,
        });
      }
    }

    console.log("🔍 Debug - Found intents:", investmentIntents?.length || 0);
    console.log("🔍 Debug - First intent:", investmentIntents?.[0]);

    // Debug: Check all intents in database to see what's stored
    const { data: allIntents, error: allError } = await supabase
      .from("investment_intents")
      .select("id, user_address, jar_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    console.log("🔍 Debug - All intents in database:", allIntents);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch investment intents" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: investmentIntents,
    });
  } catch (error) {
    console.error("Fetch investment intents error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
