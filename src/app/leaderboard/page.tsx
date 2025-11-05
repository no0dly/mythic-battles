"use client";

import { useState } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { UserSearch } from "@/components/UserSearch";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "search">(
    "leaderboard"
  );
  const [minGames, setMinGames] = useState(0);

  const handleSelectUser = (userId: string) => {
    console.log("Selected user:", userId);
  };

  return (
    <PageLayout
      title={
        activeTab === "leaderboard"
          ? t("leaderboard.leaders")
          : t("searchUsers")
      }
    >
      <div>
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab("leaderboard")}
            variant={activeTab === "leaderboard" ? "default" : "outline"}
          >
            {t("leaderboard.leaders")}
          </Button>
          <Button
            onClick={() => setActiveTab("search")}
            variant={activeTab === "search" ? "default" : "outline"}
          >
            {t("searchUsers")}
          </Button>
        </div>

        {/* Content */}
        {activeTab === "leaderboard" ? (
          <>
            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("leaderboard.minGamesRequired")}
              </label>
              <div className="flex gap-2">
                {[0, 5, 10, 20, 50].map((value) => (
                  <Button
                    key={value}
                    onClick={() => setMinGames(value)}
                    variant={minGames === value ? "default" : "outline"}
                    size="sm"
                  >
                    {value === 0 ? t("leaderboard.all") : value}
                  </Button>
                ))}
              </div>
            </div>

            <Leaderboard limit={20} minGames={minGames} />
          </>
        ) : (
          <UserSearch onSelectUser={handleSelectUser} />
        )}
      </div>
    </PageLayout>
  );
}
