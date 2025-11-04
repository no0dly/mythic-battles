"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import type { UserStatistics as UserStatsType } from "@/utils/users";
import {
  getUserRank,
  getRankTranslationKey,
  getRankBadgeVariant,
} from "@/utils/users";

interface UserStatisticsProps {
  statistics: UserStatsType;
  compact?: boolean;
}

export const UserStatistics = ({
  statistics,
  compact = false,
}: UserStatisticsProps) => {
  const { t } = useTranslation();
  const rank = getUserRank(statistics);
  const rankKey = getRankTranslationKey(rank);
  const rankVariant = getRankBadgeVariant(rank);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant={rankVariant} className="px-3 py-1">
          {t(rankKey)}
        </Badge>

        <Badge className="bg-purple-500/20 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 px-3 py-1">
          <span className="font-bold">{statistics.win_rate.toFixed(1)}%</span>
          <span className="ml-1 text-xs opacity-75">WR</span>
        </Badge>

        <Badge className="bg-green-500/20 hover:bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 px-3 py-1">
          <span className="font-bold">{statistics.wins}</span>
          <span className="ml-1 text-xs opacity-75">W</span>
        </Badge>

        <Badge className="bg-red-500/20 hover:bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30 px-3 py-1">
          <span className="font-bold">{statistics.losses}</span>
          <span className="ml-1 text-xs opacity-75">L</span>
        </Badge>

        <Badge className="bg-blue-500/20 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 px-3 py-1">
          <span className="font-bold">{statistics.total_games}</span>
          <span className="ml-1 text-xs opacity-75">{t("games")}</span>
        </Badge>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t("statistics")}</h3>
        <Badge variant={rankVariant}>{t(rankKey)}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-700 font-medium">{t("wins")}</p>
          <p className="text-3xl font-bold text-green-600">{statistics.wins}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <p className="text-sm text-red-700 font-medium">{t("losses")}</p>
          <p className="text-3xl font-bold text-red-600">{statistics.losses}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">{t("totalGames")}</p>
          <p className="text-3xl font-bold text-blue-600">
            {statistics.total_games}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-700 font-medium">{t("winRate")}</p>
          <p className="text-3xl font-bold text-purple-600">
            {statistics.win_rate.toFixed(2)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
          <p className="text-sm text-yellow-700 font-medium">
            {t("longestWinStreak")}
          </p>
          <p className="text-3xl font-bold text-yellow-600">
            {statistics.longest_win_streak}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-700 font-medium">
            {t("longestLossStreak")}
          </p>
          <p className="text-3xl font-bold text-gray-600">
            {statistics.longest_loss_streak}
          </p>
        </div>
      </div>
    </Card>
  );
};
