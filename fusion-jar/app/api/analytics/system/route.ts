import { NextResponse } from "next/server";
import { getSystemAnalytics } from "@/lib/analytics";

export async function GET() {
  try {
    const analytics = await getSystemAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching system analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch system analytics" },
      { status: 500 }
    );
  }
}
