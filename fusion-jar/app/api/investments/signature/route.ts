import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { intentId, signature, timestamp, expiry } = await request.json();

    if (!intentId || !signature || !timestamp || !expiry) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: intentId, signature, timestamp, expiry",
        },
        { status: 400 }
      );
    }

    // Update the investment intent with the signature
    const { data, error } = await supabase
      .from("investment_intents")
      .update({
        user_signature: signature,
        signature_timestamp: timestamp,
        signature_expiry: expiry,
      })
      .eq("id", intentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating signature:", error);
      return NextResponse.json(
        { error: "Failed to update signature" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Signature updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in signature update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const intentId = searchParams.get("intentId");

    if (!intentId) {
      return NextResponse.json(
        { error: "intentId is required" },
        { status: 400 }
      );
    }

    // Get the investment intent with signature info
    const { data, error } = await supabase
      .from("investment_intents")
      .select(
        "id, user_signature, signature_timestamp, signature_expiry, status"
      )
      .eq("id", intentId)
      .single();

    if (error) {
      console.error("Error fetching signature:", error);
      return NextResponse.json(
        { error: "Failed to fetch signature" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Investment intent not found" },
        { status: 404 }
      );
    }

    // Check if signature is valid and not expired
    const hasValidSignature =
      data.user_signature && data.signature_timestamp && data.signature_expiry;

    let isExpired = false;
    if (hasValidSignature) {
      const now = new Date();
      const expiry = new Date(data.signature_expiry);
      isExpired = now > expiry;
    }

    return NextResponse.json({
      hasSignature: hasValidSignature,
      isExpired,
      signatureExpiry: data.signature_expiry,
      status: data.status,
    });
  } catch (error) {
    console.error("Error in signature check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
