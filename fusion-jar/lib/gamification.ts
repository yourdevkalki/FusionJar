import { supabase } from "./supabase";

export interface GamificationEvent {
  type:
    | "investment_executed"
    | "daily_login"
    | "streak_milestone"
    | "badge_earned"
    | "first_investment"
    | "weekly_goal"
    | "monthly_goal";
  amount?: number;
  success?: boolean;
  badge?: string;
  milestone?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  criteria: {
    type: "investments" | "streak" | "amount" | "frequency";
    value: number;
  };
}

const BADGES: Badge[] = [
  {
    id: "first_investment",
    name: "First Steps",
    description: "Complete your first investment",
    icon: "🌟",
    xpReward: 50,
    criteria: { type: "investments", value: 1 },
  },
  {
    id: "streak_3",
    name: "Consistent",
    description: "Maintain a 3-day investment streak",
    icon: "🔥",
    xpReward: 100,
    criteria: { type: "streak", value: 3 },
  },
  {
    id: "streak_7",
    name: "Dedicated",
    description: "Maintain a 7-day investment streak",
    icon: "⚡",
    xpReward: 250,
    criteria: { type: "streak", value: 7 },
  },
  {
    id: "streak_30",
    name: "Unstoppable",
    description: "Maintain a 30-day investment streak",
    icon: "🏆",
    xpReward: 1000,
    criteria: { type: "streak", value: 30 },
  },
  {
    id: "investments_10",
    name: "Regular Investor",
    description: "Complete 10 investments",
    icon: "📈",
    xpReward: 200,
    criteria: { type: "investments", value: 10 },
  },
  {
    id: "investments_50",
    name: "Veteran Investor",
    description: "Complete 50 investments",
    icon: "💎",
    xpReward: 500,
    criteria: { type: "investments", value: 50 },
  },
  {
    id: "investments_100",
    name: "Master Investor",
    description: "Complete 100 investments",
    icon: "👑",
    xpReward: 1000,
    criteria: { type: "investments", value: 100 },
  },
  {
    id: "amount_1000",
    name: "Big Spender",
    description: "Invest $1000+ in total",
    icon: "💰",
    xpReward: 300,
    criteria: { type: "amount", value: 1000 },
  },
  {
    id: "amount_10000",
    name: "Whale",
    description: "Invest $10,000+ in total",
    icon: "🐋",
    xpReward: 1000,
    criteria: { type: "amount", value: 10000 },
  },
  {
    id: "weekly_investor",
    name: "Weekly Warrior",
    description: "Invest every week for 4 weeks",
    icon: "📅",
    xpReward: 400,
    criteria: { type: "frequency", value: 4 },
  },
];

export async function updateGamificationData(
  userAddress: string,
  event: GamificationEvent
) {
  try {
    // Get or create user's gamification data
    let { data: gamificationData, error } = await supabase
      .from("gamification_data")
      .select("*")
      .eq("user_address", userAddress)
      .single();

    if (error && error.code === "PGRST116") {
      // User doesn't exist, create new record
      const { data: newData, error: createError } = await supabase
        .from("gamification_data")
        .insert({
          user_address: userAddress,
          xp_points: 0,
          current_streak: 0,
          longest_streak: 0,
          total_investments: 0,
          badges_earned: [],
          last_investment_date: null,
          last_login_date: null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating gamification data:", createError);
        return;
      }

      gamificationData = newData;
    } else if (error) {
      console.error("Error fetching gamification data:", error);
      return;
    }

    if (!gamificationData) {
      console.error("No gamification data found");
      return;
    }

    let xpGained = 0;
    let newBadges: string[] = [];
    let streakUpdated = false;

    // Process the event
    switch (event.type) {
      case "daily_login":
        xpGained += 20; // 20 XP for daily login

        // Update login streak
        const today = new Date();
        const lastLogin = gamificationData.last_login_date
          ? new Date(gamificationData.last_login_date)
          : null;

        if (!lastLogin || isConsecutiveDay(today, lastLogin)) {
          gamificationData.current_streak += 1;
        } else {
          gamificationData.current_streak = 1;
        }

        gamificationData.longest_streak = Math.max(
          gamificationData.longest_streak,
          gamificationData.current_streak
        );

        gamificationData.last_login_date = today.toISOString();
        
        // Check for 7-day streak bonus
        if (gamificationData.current_streak >= 7) {
          xpGained += 50; // 50 XP bonus for 7-day streak
        }
        
        streakUpdated = true;
        break;

      case "investment_executed":
        xpGained += 30; // 30 XP for single investment

        gamificationData.total_investments += 1;
        gamificationData.last_investment_date = new Date().toISOString();
        break;

      case "streak_milestone":
        if (event.milestone) {
          xpGained += event.milestone * 25; // Bonus XP for streak milestones
        }
        break;

      case "badge_earned":
        if (event.badge) {
          const badge = BADGES.find((b) => b.id === event.badge);
          if (badge) {
            xpGained += badge.xpReward;
            newBadges.push(badge.id);
          }
        }
        break;
    }

    // Check for new badges
    const earnedBadges = await checkForNewBadges(gamificationData);
    newBadges = [...newBadges, ...earnedBadges];

    // Update gamification data
    const updateData: any = {
      xp_points: gamificationData.xp_points + xpGained,
      total_investments: gamificationData.total_investments,
      last_investment_date: gamificationData.last_investment_date,
    };

    if (streakUpdated) {
      updateData.current_streak = gamificationData.current_streak;
      updateData.longest_streak = gamificationData.longest_streak;
      if (gamificationData.last_login_date) {
        updateData.last_login_date = gamificationData.last_login_date;
      }
    }

    if (newBadges.length > 0) {
      updateData.badges_earned = [
        ...(gamificationData.badges_earned || []),
        ...newBadges,
      ];
    }

    const { error: updateError } = await supabase
      .from("gamification_data")
      .update(updateData)
      .eq("user_address", userAddress);

    if (updateError) {
      console.error("Error updating gamification data:", updateError);
      return;
    }

    // Return the updated data
    return {
      xpGained,
      newBadges,
      totalXP: gamificationData.xp_points + xpGained,
      currentStreak:
        updateData.current_streak || gamificationData.current_streak,
      totalInvestments: updateData.total_investments,
    };
  } catch (error) {
    console.error("Error in updateGamificationData:", error);
  }
}

async function checkForNewBadges(gamificationData: any): Promise<string[]> {
  const newBadges: string[] = [];
  const earnedBadges = new Set(gamificationData.badges_earned || []);

  for (const badge of BADGES) {
    if (earnedBadges.has(badge.id)) continue;

    let shouldAward = false;

    switch (badge.criteria.type) {
      case "investments":
        shouldAward =
          gamificationData.total_investments >= badge.criteria.value;
        break;
      case "streak":
        shouldAward = gamificationData.current_streak >= badge.criteria.value;
        break;
      case "amount":
        // This would need to be calculated from investment history
        // For now, we'll skip amount-based badges
        break;
      case "frequency":
        // This would need weekly investment tracking
        // For now, we'll skip frequency-based badges
        break;
    }

    if (shouldAward) {
      newBadges.push(badge.id);
    }
  }

  return newBadges;
}

function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export async function getUserGamificationData(userAddress: string) {
  try {
    const { data, error } = await supabase
      .from("gamification_data")
      .select("*")
      .eq("user_address", userAddress)
      .single();

    if (error && error.code === "PGRST116") {
      // User doesn't exist, create new record with default values
      console.log(`🆕 Creating new gamification data for user: ${userAddress}`);
      const { data: newData, error: createError } = await supabase
        .from("gamification_data")
        .insert({
          user_address: userAddress,
          xp_points: 0,
          current_streak: 0,
          longest_streak: 0,
          total_investments: 0,
          badges_earned: [],
          last_investment_date: null,
          last_login_date: null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating gamification data:", createError);
        // Return default data instead of null
        return {
          user_address: userAddress,
          xp_points: 0,
          current_streak: 0,
          longest_streak: 0,
          total_investments: 0,
          badges_earned: [],
          last_investment_date: null,
          last_login_date: null,
        };
      }

      return newData;
    } else if (error) {
      console.error("Error fetching user gamification data:", error);
      // Return default data instead of null for better UX
      return {
        user_address: userAddress,
        xp_points: 0,
        current_streak: 0,
        longest_streak: 0,
        total_investments: 0,
        badges_earned: [],
        last_investment_date: null,
        last_login_date: null,
      };
    }

    return data;
  } catch (error) {
    console.error("Error in getUserGamificationData:", error);
    // Return default data instead of null for better UX
    return {
      user_address: userAddress,
      xp_points: 0,
      current_streak: 0,
      longest_streak: 0,
      total_investments: 0,
      badges_earned: [],
      last_investment_date: null,
      last_login_date: null,
    };
  }
}

export async function getLeaderboard(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from("gamification_data")
      .select(
        "user_address, xp_points, current_streak, longest_streak, total_investments"
      )
      .order("xp_points", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    return [];
  }
}

export function getBadgeInfo(badgeId: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === badgeId);
}

export function getAllBadges(): Badge[] {
  return BADGES;
}

export function calculateLevel(xp: number): {
  level: number;
  xpToNext: number;
  progress: number;
} {
  // Level system: 10 XP increments per level
  // Level 1: 0-9 XP, Level 2: 10-19 XP, Level 3: 20-29 XP, etc.
  const level = Math.floor(xp / 10) + 1;
  const xpForCurrentLevel = (level - 1) * 10;
  const xpForNextLevel = level * 10;
  const xpToNext = xpForNextLevel - xp;
  const progress = ((xp - xpForCurrentLevel) / 10) * 100;

  return {
    level,
    xpToNext,
    progress: Math.min(progress, 100),
  };
}

export async function handleDailyLogin(userAddress: string) {
  try {
    // Get user's gamification data
    const gamificationData = await getUserGamificationData(userAddress);
    
    if (!gamificationData) {
      // Create new user data and grant login XP
      return await updateGamificationData(userAddress, { type: "daily_login" });
    }

    // Check if user already logged in today
    const today = new Date();
    const lastLogin = gamificationData.last_login_date
      ? new Date(gamificationData.last_login_date)
      : null;

    // If last login was today, don't grant XP again
    if (lastLogin) {
      const todayDateString = today.toDateString();
      const lastLoginDateString = lastLogin.toDateString();
      
      if (todayDateString === lastLoginDateString) {
        return {
          xpGained: 0,
          message: "Already logged in today",
          totalXP: gamificationData.xp_points,
          currentStreak: gamificationData.current_streak,
        };
      }
    }

    // Grant daily login XP
    return await updateGamificationData(userAddress, { type: "daily_login" });
  } catch (error) {
    console.error("Error in handleDailyLogin:", error);
    return null;
  }
}
