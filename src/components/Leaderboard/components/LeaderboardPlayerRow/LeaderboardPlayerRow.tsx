"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import AddFriendButton from "@/components/AddFriendButton";
import type { FriendshipUiStatus } from "@/hooks/useFriendshipStatus";
import { cn } from "@/lib/utils";
import { calculateWinRate } from "@/utils/users";
import {
  LEADERBOARD_ROW_BASE_CLASS,
  LEADERBOARD_ROW_GRID_CLASS,
  LEADERBOARD_ROW_GRID_WITH_ACTIONS_CLASS,
} from "../../constants";
import type { LeaderboardPlayer } from "../../types";

interface LeaderboardPlayerRowProps {
  user: LeaderboardPlayer;
  rank: number;
  showFriendActions: boolean;
  isFriendshipLoading: boolean;
  friendshipStatus: FriendshipUiStatus;
}

export default function LeaderboardPlayerRow({
  user,
  rank,
  showFriendActions,
  isFriendshipLoading,
  friendshipStatus,
}: LeaderboardPlayerRowProps) {
  const { t } = useTranslation();
  const winRate = calculateWinRate(
    user.statistics.wins,
    user.statistics.total_games
  ).toFixed(1);

  return (
    <div
      className={cn(
        LEADERBOARD_ROW_BASE_CLASS,
        showFriendActions
          ? LEADERBOARD_ROW_GRID_WITH_ACTIONS_CLASS
          : LEADERBOARD_ROW_GRID_CLASS
      )}
    >
      <div className="row-span-2 self-center text-center text-sm font-bold text-muted-foreground sm:row-span-1 sm:text-base">
        {rank}
      </div>

      <div className="row-span-2 self-center shrink-0 sm:row-span-1">
        {user.showAvatar ? (
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            width={48}
            height={48}
            className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white sm:h-12 sm:w-12 sm:text-sm">
            {user.initials}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold sm:text-base">
          {user.displayName}
        </p>
        <Badge variant={user.rankVariant} className="mt-1">
          {t(user.rankKey)}
        </Badge>
      </div>

      <div className="col-start-3 flex items-center gap-2 tabular-nums sm:hidden">
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {winRate}%
        </span>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <span className="text-sm text-foreground">
          {user.statistics.wins}W / {user.statistics.losses}L
        </span>
      </div>

      <div className="hidden text-right tabular-nums sm:block">
        <p className="text-base font-bold leading-none text-blue-600 dark:text-blue-400">
          {winRate}%
        </p>
      </div>

      <div className="hidden text-right tabular-nums sm:block">
        <p className="text-sm font-medium leading-none text-foreground">
          {user.statistics.wins}W / {user.statistics.losses}L
        </p>
      </div>

      {showFriendActions && (
        <div className="col-start-4 row-start-1 row-span-2 self-center justify-self-end sm:col-auto sm:row-auto sm:row-span-1">
          {!isFriendshipLoading ? (
            <AddFriendButton userId={user.id} status={friendshipStatus} />
          ) : (
            <div className="h-9 w-9" aria-hidden />
          )}
        </div>
      )}
    </div>
  );
}
