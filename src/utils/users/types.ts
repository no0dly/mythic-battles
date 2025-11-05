import type { UserProfile } from "@/types/database.types";

export type UserStatistics = {
  wins: number;
  losses: number;
  total_games: number;
  win_rate: number;
  longest_win_streak: number;
  longest_loss_streak: number;
};

export type UserProfileUpdate = {
  display_name?: string;
  avatar_url?: string;
};

export type UserSearchResult = Pick<
  UserProfile,
  "id" | "email" | "display_name" | "avatar_url"
>;

export type LeaderboardEntry = Pick<
  UserProfile,
  "id" | "display_name" | "avatar_url" | "statistics"
>;

export type StatisticsUpdate = Partial<UserStatistics>;

