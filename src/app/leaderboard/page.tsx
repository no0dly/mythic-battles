"use client";

import Leaderboard from "@/components/Leaderboard";
import { useTranslation } from "react-i18next";

export default function LeaderboardPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 md:py-12">
      <h2 className="mb-4 flex-shrink-0 text-2xl font-semibold text-gray-900 dark:text-white sm:mb-6 sm:text-3xl">
        {t("leaderboard.leaders")}
      </h2>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Leaderboard limit={50} />
      </div>
    </div>
  );
}
