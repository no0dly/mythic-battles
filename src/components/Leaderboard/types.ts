export type LeaderboardRankVariant =
  | "rankBeginner"
  | "rankApprentice"
  | "rankExperienced"
  | "rankExpert"
  | "rankMaster"
  | "rankLegend";

export type LeaderboardPlayer = {
  id: string;
  displayName: string;
  avatarUrl: string;
  showAvatar: boolean;
  initials: string;
  rankKey: string;
  rankVariant: LeaderboardRankVariant;
  statistics: {
    wins: number;
    losses: number;
    total_games: number;
  };
};

export type RankedLeaderboardPlayer = {
  user: LeaderboardPlayer;
  rank: number;
};
