"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLeaderboard } from "@/hooks/useUserProfile";
import {
  FRIENDSHIP_UI_STATUS,
  useFriendshipStatus,
} from "@/hooks/useFriendshipStatus";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import Loader from "@/components/Loader";
import { Card } from "@/components/ui/card";
import { SEARCH_DEFAULTS } from "@/utils/users/constants";
import { LEADERBOARD_DEFAULT_LIMIT } from "./constants";
import LeaderboardFilter from "./components/LeaderboardFilter";
import LeaderboardList from "./components/LeaderboardList";
import type { RankedLeaderboardPlayer } from "./types";

interface LeaderboardProps {
  limit?: number;
}

export default function Leaderboard({
  limit = LEADERBOARD_DEFAULT_LIMIT,
}: LeaderboardProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");
  const debouncedFilter = useDebouncedValue(
    filter.trim(),
    SEARCH_DEFAULTS.DEBOUNCE_MS
  );

  const { leaderboard, isLoading, error } = useLeaderboard(limit, 0);
  const {
    getStatusForUserId,
    isAuthenticated,
    isLoading: isFriendshipLoading,
  } = useFriendshipStatus();

  const rankedPlayers = useMemo<RankedLeaderboardPlayer[]>(
    () =>
      leaderboard.map((user, index) => ({
        user,
        rank: index + 1,
      })),
    [leaderboard]
  );

  const filteredPlayers = useMemo(() => {
    if (!debouncedFilter) return rankedPlayers;
    const query = debouncedFilter.toLowerCase();
    return rankedPlayers.filter(({ user }) =>
      user.displayName.toLowerCase().includes(query)
    );
  }, [rankedPlayers, debouncedFilter]);

  function handleFilterChange(value: string) {
    setFilter(value);
  }

  function getFriendshipStatus(userId: string) {
    if (!isAuthenticated) return FRIENDSHIP_UI_STATUS.NONE;
    return getStatusForUserId(userId);
  }

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

  return (
    <div className="space-y-4">
      <LeaderboardFilter value={filter} onValueChange={handleFilterChange} />
      <LeaderboardList
        totalCount={leaderboard.length}
        players={filteredPlayers}
        showFriendActions={isAuthenticated}
        isFriendshipLoading={isFriendshipLoading}
        getFriendshipStatus={getFriendshipStatus}
      />
    </div>
  );
}
