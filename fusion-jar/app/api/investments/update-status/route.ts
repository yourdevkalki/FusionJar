import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/utils/auth";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { intentId, status } = body;
    const userAddress = requireAuth(request);

    // Validate required fields
    if (!intentId || !status) {
      return NextResponse.json(
        { error: "Intent ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["active", "paused", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: active, paused, cancelled" },
        { status: 400 }
      );
    }

    // First, verify the intent belongs to the authenticated user
    const { data: existingIntent, error: fetchError } = await supabase
      .from("investment_intents")
      .select("id, user_address")
      .eq("id", intentId)
      .single();

    if (fetchError || !existingIntent) {
      return NextResponse.json(
        { error: "Investment intent not found" },
        { status: 404 }
      );
    }

    if (
      existingIntent.user_address.toLowerCase() !== userAddress.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Update the intent status
    const { data: updatedIntent, error: updateError } = await supabase
      .from("investment_intents")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", intentId)
      .select()
      .single();

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json(
        { error: "Failed to update investment intent" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedIntent,
      message: `Investment intent ${status} successfully`,
    });
  } catch (error) {
    console.error("Update investment intent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
