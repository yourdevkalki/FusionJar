import { NextRequest, NextResponse } from "next/server";
import { getPortfolioAnalytics, getInvestmentInsights } from "@/lib/analytics";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const timeframe =
      (searchParams.get("timeframe") as "7d" | "30d" | "90d") || "30d";

    switch (action) {
      case "insights":
        const insights = await getInvestmentInsights(params.address);
        return NextResponse.json(insights);

      default:
        // Get portfolio analytics
        const analytics = await getPortfolioAnalytics(
          params.address,
          timeframe
        );
        return NextResponse.json(analytics);
    }
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio analytics" },
      { status: 500 }
    );
  }
}
