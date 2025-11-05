"use client";

import { useLeaderboard } from "@/hooks/useUserProfile";
import Loader from "@/components/Loader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface LeaderboardProps {
  limit?: number;
  minGames?: number;
}

export const Leaderboard = ({ limit = 10, minGames = 5 }: LeaderboardProps) => {
  const { t } = useTranslation();
  const { leaderboard, isLoading, error } = useLeaderboard(limit, minGames);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500">{t("errorLoadingProfile")}</p>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">{t("leaderboard.noData")}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {/* Position */}
            <div className="flex-shrink-0 w-8 text-center">
              <span className="text-lg font-bold text-gray-600">
                #{index + 1}
              </span>
            </div>

            {/* Avatar */}
              <div className="flex-shrink-0">
                {user.showAvatar ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    width={50}
                    height={50}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {user.initials}
                  </div>
                )}
              </div>

            {/* User Info */}
            <div className="flex-grow">
              <p className="font-semibold">{user.displayName}</p>
              <Badge variant={user.rankVariant} className="mt-1">
                {t(user.rankKey)}
              </Badge>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="font-bold text-blue-600">
                {user.statistics.win_rate.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600">
                {user.statistics.wins}W / {user.statistics.losses}L
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
