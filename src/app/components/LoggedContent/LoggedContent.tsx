"use client";
import SessionsCard from "../SessionsCard";
import UserInfoCard from "../UserInfoCard";
import { useTranslation } from "react-i18next";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { UserStatistics } from "@/components/UserStatistics";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";

function LoggedContent() {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const router = useRouter();

  const displayName = user?.displayName ?? "Warrior";

  const onStartNewGameHandler = () => {
    router.push("/draft-settings");
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8 md:mb-10 flex-shrink-0">
        {t("welcomeUser", { name: displayName })}
      </h2>
      <div className="w-full flex h-full flex-col md:flex-row gap-4 md:gap-6 justify-between flex-1 min-h-0">
        <div className="md:flex-shrink-0 md:w-80 space-y-4 md:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6">
              {t("userInfo")}
            </h3>
            <UserInfoCard />
          </div>

          {user && (
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                  {t("statistics")}
                </h3>
              </div>
              <UserStatistics statistics={user.statistics} compact />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 md:gap-6 items-stretch md:items-end flex-1 min-h-0">
          <div className="flex flex-col gap-4 md:gap-6 items-stretch md:items-end flex-1 min-h-0">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
              {t("sessions")}
            </h3>
            <SessionsCard />
          </div>
          <div className="flex-shrink-0 w-full lg:w-auto">
            <ShimmerButton
              className="px-8 py-4 text-lg font-semibold"
              onClick={onStartNewGameHandler}
            >
              {t("startNewGame")}
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoggedContent;
