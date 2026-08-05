"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import type { FriendshipUiStatus } from "@/hooks/useFriendshipStatus";
import LeaderboardPlayerRow from "../LeaderboardPlayerRow";
import type { RankedLeaderboardPlayer } from "../../types";

interface LeaderboardListProps {
  totalCount: number;
  players: RankedLeaderboardPlayer[];
  showFriendActions: boolean;
  isFriendshipLoading: boolean;
  getFriendshipStatus: (userId: string) => FriendshipUiStatus;
}

export default function LeaderboardList({
  totalCount,
  players,
  showFriendActions,
  isFriendshipLoading,
  getFriendshipStatus,
}: LeaderboardListProps) {
  const { t } = useTranslation();

  if (totalCount === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-gray-500">{t("leaderboard.noData")}</p>
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-muted-foreground">
          {t("leaderboard.noFilterResults")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-3 sm:p-4 md:p-6">
      <p className="mb-3 text-sm text-muted-foreground sm:mb-4">
        {t("leaderboard.showingPlayers", {
          count: players.length,
        })}
      </p>

      <div className="min-w-0 space-y-2">
        {players.map(({ user, rank }) => (
          <LeaderboardPlayerRow
            key={user.id}
            user={user}
            rank={rank}
            showFriendActions={showFriendActions}
            isFriendshipLoading={isFriendshipLoading}
            friendshipStatus={getFriendshipStatus(user.id)}
          />
        ))}
      </div>
    </Card>
  );
}
