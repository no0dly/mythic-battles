/**
 * Default user statistics when creating a new user
 */
export const DEFAULT_STATISTICS = {
  wins: 0,
  losses: 0,
  total_games: 0,
  win_rate: 0.0,
  longest_win_streak: 0,
  longest_loss_streak: 0,
} as const;

/**
 * Maximum length for display name
 */
export const MAX_DISPLAY_NAME_LENGTH = 50;

/**
 * Default avatar URL (placeholder)
 */
export const DEFAULT_AVATAR_URL = "";

/**
 * User ranks based on statistics
 * These are rank identifiers that can be used for localization
 */
export const USER_RANKS = {
  BEGINNER: "beginner",
  APPRENTICE: "apprentice",
  EXPERIENCED: "experienced",
  EXPERT: "expert",
  MASTER: "master",
  LEGEND: "legend",
} as const;

/**
 * Thresholds for user ranks
 */
export const RANK_THRESHOLDS = {
  BEGINNER: { minGames: 0, minWinRate: 0 },
  APPRENTICE: { minGames: 5, minWinRate: 0 },
  EXPERIENCED: { minGames: 5, minWinRate: 60 },
  EXPERT: { minGames: 20, minWinRate: 70 },
  MASTER: { minGames: 50, minWinRate: 70 },
  LEGEND: { minGames: 50, minWinRate: 80 },
} as const;

/**
 * Default leaderboard settings
 */
export const LEADERBOARD_DEFAULTS = {
  LIMIT: 10,
  MIN_GAMES: 5,
  MAX_LIMIT: 100,
} as const;

/**
 * Search settings
 */
export const SEARCH_DEFAULTS = {
  LIMIT: 10,
  MAX_LIMIT: 50,
  MIN_QUERY_LENGTH: 1,
} as const;

/**
 * Activity settings
 */
export const ACTIVITY_SETTINGS = {
  ACTIVE_DAYS_THRESHOLD: 30,
  INACTIVE_DAYS_THRESHOLD: 90,
} as const;

