import { NextRequest, NextResponse } from "next/server";
import {
  getUserGamificationData,
  getLeaderboard,
  calculateLevel,
  getAllBadges,
} from "@/lib/gamification";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "leaderboard":
        const limit = parseInt(searchParams.get("limit") || "10");
        const leaderboard = await getLeaderboard(limit);
        return NextResponse.json(leaderboard);

      case "badges":
        const badges = getAllBadges();
        return NextResponse.json(badges);

      default:
        // Get user gamification data
        const userData = await getUserGamificationData(address);

        if (!userData) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        // Calculate level information
        const levelInfo = calculateLevel(userData.xp_points);

        return NextResponse.json({
          ...userData,
          level: levelInfo.level,
          xp_to_next: levelInfo.xpToNext,
          progress: levelInfo.progress,
        });
    }
  } catch (error) {
    console.error("Error fetching gamification data:", error);
    return NextResponse.json(
      { error: "Failed to fetch gamification data" },
      { status: 500 }
    );
  }
}
