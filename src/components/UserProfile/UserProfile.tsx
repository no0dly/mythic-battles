"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import Loader from "@/components/Loader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export const UserProfile = () => {
  const { t } = useTranslation();
  const { user, isLoading, error } = useUserProfile();

  if (isLoading) {
    return <Loader />;
  }

  if (error || !user) {
    return (
      <Card className="p-6">
        <p className="text-red-500">{t("errorLoadingProfile")}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.showAvatar ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              width={50}
              height={50}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {user.initials}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-grow">
          <h2 className="text-2xl font-bold">{user.displayName}</h2>
          <p className="text-gray-600">{user.email}</p>
          <div className="mt-2">
            <Badge variant={user.rankVariant}>
              {t(user.rankKey)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">{t("statistics")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">{t("wins")}</p>
            <p className="text-2xl font-bold text-green-600">
              {user.statistics.wins}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">{t("losses")}</p>
            <p className="text-2xl font-bold text-red-600">
              {user.statistics.losses}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">{t("totalGames")}</p>
            <p className="text-2xl font-bold">{user.statistics.total_games}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">{t("winRate")}</p>
            <p className="text-2xl font-bold text-blue-600">
              {user.statistics.win_rate.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">{t("longestWinStreak")}</p>
            <p className="text-2xl font-bold">
              {user.statistics.longest_win_streak}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">{t("longestLossStreak")}</p>
            <p className="text-2xl font-bold">
              {user.statistics.longest_loss_streak}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

