"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Trophy,
  Star,
  Flame,
  TrendingUp,
  Award,
  Users,
  Target,
  Zap,
  Crown,
  Medal,
} from "lucide-react";

interface GamificationData {
  user_address: string;
  xp_points: number;
  current_streak: number;
  longest_streak: number;
  total_investments: number;
  badges_earned: string[];
  last_investment_date: string;
  level: number;
  xp_to_next: number;
  progress: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

interface LeaderboardEntry {
  user_address: string;
  xp_points: number;
  current_streak: number;
  longest_streak: number;
  total_investments: number;
}

export default function GamificationDashboard() {
  const { address, authenticatedFetch } = useAuth();
  const [gamificationData, setGamificationData] =
    useState<GamificationData | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchGamificationData();
    }
  }, [address]);

  const fetchGamificationData = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const [userData, badgesData, leaderboardData] = await Promise.all([
        authenticatedFetch(`/api/gamification/user/${address}`),
        authenticatedFetch(`/api/gamification/user/${address}?action=badges`),
        authenticatedFetch(
          `/api/gamification/user/${address}?action=leaderboard&limit=10`
        ),
      ]);

      if (userData.ok) {
        const userDataJson = await userData.json();
        setGamificationData(userDataJson);
      }

      if (badgesData.ok) {
        const badgesJson = await badgesData.json();
        setBadges(badgesJson);
      }

      if (leaderboardData.ok) {
        const leaderboardJson = await leaderboardData.json();
        setLeaderboard(leaderboardJson);
      }
    } catch (error) {
      console.error("Error fetching gamification data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeIcon = (badgeId: string) => {
    const badge = badges.find((b) => b.id === badgeId);
    return badge?.icon || "🏆";
  };

  const getBadgeName = (badgeId: string) => {
    const badge = badges.find((b) => b.id === badgeId);
    return badge?.name || "Unknown Badge";
  };

  const getBadgeDescription = (badgeId: string) => {
    const badge = badges.find((b) => b.id === badgeId);
    return badge?.description || "No description available";
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return "text-purple-600";
    if (level >= 15) return "text-purple";
    if (level >= 10) return "text-green";
    if (level >= 5) return "text-yellow-600";
    return "text-gray-500";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-red-600";
    if (streak >= 15) return "text-orange-600";
    if (streak >= 7) return "text-yellow-600";
    if (streak >= 3) return "text-green";
    return "text-gray-500";
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!gamificationData) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Start Your Journey
        </h3>
        <p className="text-gray-500 mb-6">
          Complete your first investment to start earning XP and badges!
        </p>
        <a
          href="/create"
          className="inline-flex items-center px-4 py-2 bg-purple text-white rounded-md hover:bg-purple-dark"
        >
          Create Investment
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Level and XP Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              Level {gamificationData.level}
            </h2>
            <p className="text-blue-100">
              {gamificationData.xp_points} XP • {gamificationData.xp_to_next} XP
              to next level
            </p>
          </div>
          <div className="text-right">
            <Crown className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
        <div className="w-full bg-blue-400 rounded-full h-3">
          <div
            className="bg-yellow-300 h-3 rounded-full transition-all duration-300"
            style={{ width: `${gamificationData.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-background p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Current Streak
              </p>
              <p
                className={`text-2xl font-bold ${getStreakColor(
                  gamificationData.current_streak
                )}`}
              >
                {gamificationData.current_streak} days
              </p>
            </div>
            <Flame
              className={`w-8 h-8 ${getStreakColor(
                gamificationData.current_streak
              )}`}
            />
          </div>
        </div>

        <div className="bg-background p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Longest Streak
              </p>
              <p className="text-2xl font-bold text-white">
                {gamificationData.longest_streak} days
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-background p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Investments
              </p>
              <p className="text-2xl font-bold text-white">
                {gamificationData.total_investments}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple" />
          </div>
        </div>

        <div className="bg-background p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Badges Earned</p>
              <p className="text-2xl font-bold text-white">
                {gamificationData.badges_earned.length}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Badges and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges Section */}
        <div className="bg-background rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-500">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Medal className="w-5 h-5 mr-2 text-yellow" />
              Badges Earned
            </h3>
          </div>
          <div className="p-6">
            {gamificationData.badges_earned.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {gamificationData.badges_earned.map((badgeId) => (
                  <div
                    key={badgeId}
                    className="text-center p-4 bg-background rounded-lg"
                  >
                    <div className="text-3xl mb-2">{getBadgeIcon(badgeId)}</div>
                    <h4 className="font-medium text-white">
                      {getBadgeName(badgeId)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {getBadgeDescription(badgeId)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  No badges earned yet. Keep investing to earn badges!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="bg-background rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-500">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow" />
              Leaderboard
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user_address}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.user_address === address
                      ? "bg-purple border border-purple"
                      : "bg-background"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 mr-3">
                      {index === 0 && (
                        <Crown className="w-4 h-4 text-yellow" />
                      )}
                      {index === 1 && (
                        <Medal className="w-4 h-4 text-gray-500" />
                      )}
                      {index === 2 && (
                        <Award className="w-4 h-4 text-orange" />
                      )}
                      {index > 2 && (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {entry.user_address === address
                          ? "You"
                          : `${entry.user_address.slice(
                              0,
                              6
                            )}...${entry.user_address.slice(-4)}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Level {Math.floor(Math.sqrt(entry.xp_points / 100)) + 1}{" "}
                        • {entry.xp_points} XP
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {entry.xp_points} XP
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.current_streak} day streak
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Badges */}
      <div className="bg-background rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-500">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-purple" />
            Available Badges
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const isEarned = gamificationData.badges_earned.includes(
                badge.id
              );
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 ${
                    isEarned
                      ? "border-green bg-green"
                      : "border-gray-500 bg-background"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{badge.icon}</span>
                    <div>
                      <h4 className="font-medium text-white">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        +{badge.xpReward} XP
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{badge.description}</p>
                  {isEarned && (
                    <div className="mt-2 flex items-center text-green">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-xs font-medium">Earned</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
