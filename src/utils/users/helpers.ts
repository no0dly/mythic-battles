import type { UserProfile } from "@/types/database.types";
import type { UserStatistics } from "./types";
import { USER_RANKS } from "./constants";

/**
 * Calculate win rate percentage from wins and total games
 */
export const calculateWinRate = (wins: number, totalGames: number): number => {
  if (totalGames === 0) return 0;
  return Number(((wins / totalGames) * 100).toFixed(2));
};

/**
 * Format user display name with fallback to email username
 */
export const formatDisplayName = (
  displayName: string,
  email: string
): string => {
  if (displayName && displayName.trim().length > 0) {
    return displayName;
  }
  return email.split("@")[0] ?? "User";
};

/**
 * Get user initials for avatar placeholder
 */
export const getUserInitials = (
  displayName: string,
  email: string
): string => {
  const name = formatDisplayName(displayName, email);
  const parts = name.split(" ");

  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
};

/**
 * Check if user has avatar
 */
export const hasAvatar = (avatarUrl: string | null | undefined): boolean => {
  return Boolean(avatarUrl && avatarUrl.trim().length > 0);
};

/**
 * Format statistics for display
 */
export const formatStatistics = (
  stats: UserStatistics
): Record<string, string | number> => {
  return {
    wins: stats.wins,
    losses: stats.losses,
    totalGames: stats.total_games,
    winRate: `${stats.win_rate.toFixed(2)}%`,
    longestWinStreak: stats.longest_win_streak,
    longestLossStreak: stats.longest_loss_streak,
  };
};

/**
 * Update statistics after a game
 */
export const updateStatsAfterGame = (
  currentStats: UserStatistics,
  isWin: boolean
): UserStatistics => {
  const newWins = isWin ? currentStats.wins + 1 : currentStats.wins;
  const newLosses = isWin ? currentStats.losses : currentStats.losses + 1;
  const newTotalGames = currentStats.total_games + 1;
  const newWinRate = calculateWinRate(newWins, newTotalGames);

  return {
    wins: newWins,
    losses: newLosses,
    total_games: newTotalGames,
    win_rate: newWinRate,
    longest_win_streak: isWin
      ? Math.max(currentStats.longest_win_streak, newWins)
      : currentStats.longest_win_streak,
    longest_loss_streak: !isWin
      ? Math.max(currentStats.longest_loss_streak, newLosses)
      : currentStats.longest_loss_streak,
  };
};

/**
 * Validate profile update data
 */
export const validateProfileUpdate = (data: {
  display_name?: string;
  avatar_url?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.display_name !== undefined) {
    if (data.display_name.trim().length === 0) {
      errors.push("Display name cannot be empty");
    }
    if (data.display_name.length > 50) {
      errors.push("Display name must be less than 50 characters");
    }
  }

  if (data.avatar_url !== undefined && data.avatar_url.length > 0) {
    try {
      new URL(data.avatar_url);
    } catch {
      errors.push("Avatar URL must be a valid URL");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if user is active (has played games recently)
 */
export const isActiveUser = (
  user: UserProfile,
  daysThreshold: number = 30
): boolean => {
  const lastUpdate = new Date(user.updated_at);
  const now = new Date();
  const daysSinceUpdate =
    (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceUpdate <= daysThreshold && user.statistics.total_games > 0;
};

/**
 * Get user rank based on statistics
 * Returns rank identifier (not localized string)
 */
export const getUserRank = (stats: UserStatistics): string => {
  const { total_games, win_rate } = stats;

  if (total_games < 5) return USER_RANKS.BEGINNER;
  if (total_games < 20) {
    if (win_rate >= 60) return USER_RANKS.EXPERIENCED;
    return USER_RANKS.APPRENTICE;
  }
  if (total_games < 50) {
    if (win_rate >= 70) return USER_RANKS.EXPERT;
    if (win_rate >= 50) return USER_RANKS.EXPERIENCED;
    return USER_RANKS.APPRENTICE;
  }

  if (win_rate >= 80) return USER_RANKS.LEGEND;
  if (win_rate >= 70) return USER_RANKS.MASTER;
  if (win_rate >= 60) return USER_RANKS.EXPERT;
  if (win_rate >= 50) return USER_RANKS.EXPERIENCED;

  return USER_RANKS.APPRENTICE;
};

/**
 * Get i18n translation key for user rank
 * @param rank - Rank identifier from getUserRank
 * @returns Translation key for i18n (e.g., "rankBeginner")
 */
export const getRankTranslationKey = (rank: string): string => {
  const rankMap: Record<string, string> = {
    [USER_RANKS.BEGINNER]: "rankBeginner",
    [USER_RANKS.APPRENTICE]: "rankApprentice",
    [USER_RANKS.EXPERIENCED]: "rankExperienced",
    [USER_RANKS.EXPERT]: "rankExpert",
    [USER_RANKS.MASTER]: "rankMaster",
    [USER_RANKS.LEGEND]: "rankLegend",
  };

  return rankMap[rank] ?? "rankBeginner";
};

/**
 * Get Badge variant for user rank
 * @param rank - Rank identifier from getUserRank
 * @returns Badge variant name
 */
export const getRankBadgeVariant = (rank: string): "rankBeginner" | "rankApprentice" | "rankExperienced" | "rankExpert" | "rankMaster" | "rankLegend" => {
  const variantMap: Record<string, "rankBeginner" | "rankApprentice" | "rankExperienced" | "rankExpert" | "rankMaster" | "rankLegend"> = {
    [USER_RANKS.BEGINNER]: "rankBeginner",
    [USER_RANKS.APPRENTICE]: "rankApprentice",
    [USER_RANKS.EXPERIENCED]: "rankExperienced",
    [USER_RANKS.EXPERT]: "rankExpert",
    [USER_RANKS.MASTER]: "rankMaster",
    [USER_RANKS.LEGEND]: "rankLegend",
  };

  return variantMap[rank] ?? "rankBeginner";
};

/**
 * Compare two users for sorting (by win rate, then by total games)
 */
export const compareUsersByRank = (a: UserProfile, b: UserProfile): number => {
  // First compare by win rate
  if (a.statistics.win_rate !== b.statistics.win_rate) {
    return b.statistics.win_rate - a.statistics.win_rate;
  }

  // If win rates are equal, compare by total games
  return b.statistics.total_games - a.statistics.total_games;
};

/**
 * Filter users for search
 */
export const filterUsersByQuery = (
  users: UserProfile[],
  query: string
): UserProfile[] => {
  const lowerQuery = query.toLowerCase();

  return users.filter(
    (user) =>
      user.email.toLowerCase().includes(lowerQuery) ||
      user.display_name.toLowerCase().includes(lowerQuery)
  );
};

