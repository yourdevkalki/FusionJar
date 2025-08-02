import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/utils/auth";
import { handleDailyLogin } from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const userAddress = requireAuth(request);

    const result = await handleDailyLogin(userAddress);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to process daily login" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Daily login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}