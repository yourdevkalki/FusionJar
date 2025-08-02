"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserGamificationData, calculateLevel, handleDailyLogin } from "@/lib/gamification";
import { Edit2, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { WalletBalance } from "./WalletBalance";

export function ProfilePage() {
  const { address, authenticatedFetch } = useAuth();
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("User");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    if (address) {
      fetchGamificationData();
      handleDailyLoginReward();
    }
  }, [address]);

  const fetchGamificationData = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const data = await getUserGamificationData(address);
      setGamificationData(data);
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyLoginReward = async () => {
    if (!address) return;

    try {
      const result = await handleDailyLogin(address);
      if (result && result.xpGained > 0) {
        toast.success(`+${result.xpGained} XP for daily login!`);
        // Refresh data after login reward
        setTimeout(fetchGamificationData, 1000);
      }
    } catch (error) {
      console.error("Failed to handle daily login:", error);
    }
  };

  const handleSaveName = () => {
    setUserName(editedName);
    setIsEditingName(false);
    toast.success("Name updated successfully!");
    // Here you could add API call to save name to backend
  };

  const handleCancelEdit = () => {
    setEditedName(userName);
    setIsEditingName(false);
  };

  const handleStartEdit = () => {
    setEditedName(userName);
    setIsEditingName(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  const xp = gamificationData?.xp_points || 0;
  const { level, xpToNext, progress } = calculateLevel(xp);
  const currentStreak = gamificationData?.current_streak || 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-[var(--secondary-500)] to-transparent p-6 sm:p-8">
            {/* Profile Picture */}
            <div
              className="size-32 rounded-full bg-cover bg-center bg-no-repeat ring-4 ring-[var(--primary-500)]"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD-yLm2IrJbOC870m61Xv4pvuvy9g3ufebElWziDZLNRN3t9ipee87vBC-CDtczH9TjLCNMQGn5z6YtVjfLs35XhYsVrGchgw05KpSbjQGLWJpqT2vySTjGIiMkRrOXA_LMA07-vmWy-u3_L64Xco706UKCzgsha475vpQduD8kGfiQ0QgmM3KVbDbhqhDPLLLtIKxwW9UPqOtm6Y1ZW0xPW7G_GeOpM7QyaBtY-mHqcZKZpFoEj268CsQHgw1O9Gmqs-q5XNYmBw")',
              }}
            ></div>

            {/* Editable Name */}
            <div className="text-center">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-bold bg-[var(--secondary-600)] text-white px-3 py-1 rounded-lg border border-[var(--secondary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-green-500 hover:text-green-400"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-500 hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold text-white">{userName}</h2>
                  <button
                    onClick={handleStartEdit}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              )}
              <p className="text-[var(--secondary-400)]">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
              </p>
            </div>

            {/* Stats Grid - Updated to remove Badges */}
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--secondary-500)] bg-[var(--secondary-600)] p-4">
                <p className="text-3xl font-bold text-white">Level {level}</p>
                <p className="text-sm text-[var(--secondary-400)]">Current Level</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--secondary-500)] bg-[var(--secondary-600)] p-4">
                <p className="text-3xl font-bold text-yellow-400">{xp} XP</p>
                <p className="text-sm text-[var(--secondary-400)]">Total XP</p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <p className="text-white">XP Progress to Level {level + 1}</p>
                <p className="text-white">{Math.max(0, 10 - (xp % 10))} XP to next level</p>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--secondary-500)]">
                <div
                  className="h-full rounded-full bg-[var(--primary-500)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="flex w-full items-center justify-between rounded-xl border border-[var(--secondary-500)] bg-[var(--secondary-600)] p-4">
              <p className="font-medium text-white">Current Streak (Daily Login)</p>
              <p className="flex items-center gap-1 text-lg font-bold text-orange-400">
                {currentStreak}<span className="text-2xl">🔥</span>
              </p>
            </div>
          </div>

          {/* XP Information */}
          <div className="mt-8 rounded-2xl bg-[var(--secondary-600)] p-6">
            <h3 className="mb-4 text-2xl font-bold text-white">How to Earn XP</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--secondary-500)]">
                <span className="text-white">Daily Login</span>
                <span className="font-bold text-yellow-400">+20 XP</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--secondary-500)]">
                <span className="text-white">Complete Investment</span>
                <span className="font-bold text-yellow-400">+30 XP</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--secondary-500)]">
                <span className="text-white">7-Day Login Streak Bonus</span>
                <span className="font-bold text-yellow-400">+50 XP</span>
              </div>
            </div>
          </div>

          {/* Level System Information */}
          <div className="mt-8 rounded-2xl bg-[var(--secondary-600)] p-6">
            <h3 className="mb-4 text-2xl font-bold text-white">Level System</h3>
            <p className="text-[var(--secondary-400)] mb-4">
              Each level requires 10 XP. Your current level is determined by your total XP.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">Level 1:</span>
                <span className="text-[var(--secondary-400)]">0-9 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">Level 2:</span>
                <span className="text-[var(--secondary-400)]">10-19 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">Level 3:</span>
                <span className="text-[var(--secondary-400)]">20-29 XP</span>
              </div>
              <div className="text-center text-sm text-[var(--secondary-400)] mt-3">
                ...and so on (+10 XP per level)
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="mt-8">
            <WalletBalance />
          </div>
        </div>
      </main>
    </div>
  );
}