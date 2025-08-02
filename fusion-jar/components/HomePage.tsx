"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserGamificationData,
  calculateLevel,
  handleDailyLogin,
} from "@/lib/gamification";
import { Trophy, Star, Target, Calendar, Zap, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { LandingPage } from "./LandingPage";

export function HomePage() {
  const { address, authenticated, authenticatedFetch } = useAuth();
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [recentInvestments, setRecentInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authenticated && address) {
      fetchData();
      handleDailyLoginReward();
    } else {
      setLoading(false);
    }
  }, [authenticated, address]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    if (!authenticated || !address) return;

    try {
      // Fetch gamification data
      const gamData = await getUserGamificationData(address);
      setGamificationData(gamData);

      // Fetch recent investments
      try {
        const response = await authenticatedFetch(`/api/history/${address}`);
        if (response.ok) {
          const data = await response.json();
          setRecentInvestments(data.recentInvestments?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error("Failed to fetch investment history:", error);
      }
    } catch (error) {
      console.error("Failed to fetch homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyLoginReward = async () => {
    if (!authenticated || !address) return;

    try {
      const response = await authenticatedFetch("/api/auth/daily-login", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.xpGained > 0) {
          toast.success(`🎉 Daily login bonus: +${data.xpGained} XP!`);
          // Refresh gamification data to show updated XP
          setTimeout(fetchData, 1000);
        }
      }
    } catch (error) {
      console.error("Failed to handle daily login:", error);
    }
  };

  const levelData = gamificationData
    ? calculateLevel(gamificationData.xp_points)
    : { level: 1, xpToNext: 10, progress: 0 };
  const totalInvested = recentInvestments.reduce(
    (sum, inv) => sum + (inv.amount || 0),
    0
  );
  const uniqueChains = new Set(recentInvestments.map((inv) => inv.source_chain))
    .size;

  // Show landing page for non-authenticated users
  if (!authenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className=" mx-auto m-10 max-w-[90vw] px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {loading && !gamificationData ? (
            // Loading skeleton for data cards
            <>
              <div className="bg-gray-800 rounded-lg p-6 col-span-2 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-20 mb-3"></div>
                <div className="h-8 bg-gray-700 rounded w-16 mb-3"></div>
                <div className="h-2 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-24"></div>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-700 rounded w-16 mb-3"></div>
                  <div className="h-8 bg-gray-700 rounded w-12 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* XP Progress */}
              <div className="bg-gray-800 rounded-lg p-6 col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-white text-sm">XP Progress</h3>
                </div>
                <p className="text-white text-2xl font-bold mb-3">
                  Level {levelData.level}
                </p>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>{gamificationData?.xp_points || 0} XP</span>
                  <span>
                    {(gamificationData?.xp_points || 0) + levelData.xpToNext} XP
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${levelData.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {levelData.xpToNext} XP to Level {levelData.level + 1}
                </p>
              </div>

              {/* Streak */}
              <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="text-3xl mb-2">🔥</div>
                <p className="text-orange-400 text-2xl font-bold">
                  Day {gamificationData?.current_streak || 0}
                </p>
                <p className="text-white text-sm">Streak</p>
                {(gamificationData?.current_streak || 0) >= 7 && (
                  <div className="mt-2 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                    Bonus Active!
                  </div>
                )}
              </div>

              {/* Total Invested */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <h3 className="text-white text-sm">Total Invested</h3>
                </div>
                <p className="text-green-400 text-2xl font-bold">
                  ${totalInvested.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {gamificationData?.total_investments || 0} investments
                </p>
              </div>

              {/* Chains Used */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h3 className="text-white text-sm">Chains Used</h3>
                </div>
                <p className="text-blue-400 text-2xl font-bold">
                  {uniqueChains || 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">Networks</p>
              </div>

              {/* XP Earned */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-white text-sm">Total XP</h3>
                </div>
                <p className="text-yellow-400 text-2xl font-bold">
                  {gamificationData?.xp_points?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">Points earned</p>
              </div>
            </>
          )}
        </div>

        {/* Gamification Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Daily Rewards */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Daily Rewards</h3>
                <p className="text-purple-300 text-sm">Login streak bonus</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Daily Login</span>
                <span className="text-yellow-400 font-medium">+20 XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Investment</span>
                <span className="text-yellow-400 font-medium">+30 XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">7-Day Streak</span>
                <span className="text-yellow-400 font-medium">+50 XP</span>
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Next Milestone</h3>
                <p className="text-green-300 text-sm">
                  Level {levelData.level + 1}
                </p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Progress</span>
                <span>{levelData.xpToNext} XP to go</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                  style={{ width: `${levelData.progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Unlock new features and rewards at the next level!
            </p>
          </div>

          {/* Recent Achievement */}
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Progress Stats</h3>
                <p className="text-yellow-300 text-sm">Your journey</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Current Level</span>
                <span className="text-yellow-400 font-medium">
                  {levelData.level}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Best Streak</span>
                <span className="text-yellow-400 font-medium">
                  {gamificationData?.longest_streak || 0} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Total Investments</span>
                <span className="text-yellow-400 font-medium">
                  {gamificationData?.total_investments || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Investment History */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Recent Investment History
            </h2>
            {address && (
              <button
                onClick={() => (window.location.href = "/history")}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                View All →
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-lg p-4 animate-pulse"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !address ? (
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-400 text-sm">
                Connect your wallet to see your investment history and track
                your DeFi journey.
              </p>
            </div>
          ) : recentInvestments.length === 0 ? (
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">
                Start Your Journey
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                You haven't made any investments yet. Start with as little as
                $1!
              </p>
              <button
                onClick={() => (window.location.href = "/create")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Create Your First Investment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInvestments.map((investment, index) => {
                const chainNames: Record<number, string> = {
                  1: "Ethereum",
                  137: "Polygon",
                  56: "BSC",
                  8453: "Base",
                  42161: "Arbitrum",
                };

                const formatTimeAgo = (date: string) => {
                  const now = new Date();
                  const investmentDate = new Date(date);
                  const diffMs = now.getTime() - investmentDate.getTime();
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffHours / 24);

                  if (diffDays > 0)
                    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
                  if (diffHours > 0)
                    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
                  return "Just now";
                };

                return (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          ${investment.amount} Investment
                        </p>
                        <p className="text-gray-400 text-sm">
                          on{" "}
                          {chainNames[investment.source_chain] ||
                            `Chain ${investment.source_chain}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {investment.status === "completed"
                          ? "✅"
                          : investment.status === "pending"
                          ? "⏳"
                          : "❌"}
                        {investment.status}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatTimeAgo(investment.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
