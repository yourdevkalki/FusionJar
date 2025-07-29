import { NextRequest, NextResponse } from "next/server";
import {
  getResolverStats,
  getExecutionAnalytics,
  getResolverLeaderboard,
  getResolverDetails,
} from "@/lib/resolver-transparency";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const timeframe =
      (searchParams.get("timeframe") as "24h" | "7d" | "30d") || "7d";
    const limit = parseInt(searchParams.get("limit") || "10");

    switch (action) {
      case "stats":
        const resolverAddress = searchParams.get("resolver");
        const stats = await getResolverStats(resolverAddress || undefined);
        return NextResponse.json(stats);

      case "analytics":
        const analytics = await getExecutionAnalytics(timeframe);
        return NextResponse.json(analytics);

      case "leaderboard":
        const leaderboard = await getResolverLeaderboard(limit);
        return NextResponse.json(leaderboard);

      case "details":
        const address = searchParams.get("resolver");
        if (!address) {
          return NextResponse.json(
            { error: "Resolver address is required" },
            { status: 400 }
          );
        }
        const details = await getResolverDetails(address);
        return NextResponse.json(details);

      default:
        // Return general analytics
        const generalAnalytics = await getExecutionAnalytics(timeframe);
        return NextResponse.json(generalAnalytics);
    }
  } catch (error) {
    console.error("Error fetching resolver analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch resolver analytics" },
      { status: 500 }
    );
  }
}
