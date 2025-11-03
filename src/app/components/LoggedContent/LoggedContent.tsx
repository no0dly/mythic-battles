"use client";
import SessionsCard from "../SessionsCard";
import UserInfoCard from "../UserInfoCard";
import { useTranslation } from "react-i18next";
import { ShimmerButton } from "@/components/ui/shimmer-button";

function LoggedContent() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-10">
        {t("welcomeUser", { name: "Warrior" })}
      </h2>
      <div className="w-full flex gap-4 justify-between flex-1 min-h-0 overflow-hidden">
        <div className="lg:flex-shrink-0 lg:w-80 overflow-y-auto">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">
            {t("userInfo")}
          </h3>
          <UserInfoCard />
        </div>
        <div className="flex flex-col gap-4 md:gap-6 items-end flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 md:gap-6 items-end overflow-y-auto flex-1 min-h-0">
            <h3 className="text-lg md:text-xl font-bold text-foreground self-start">
              {t("sessions")}
            </h3>
            <SessionsCard />
          </div>
          <div className="flex-shrink-0">
            <ShimmerButton className="px-8 py-4 text-lg font-semibold">
              {t("startNewGame")}
            </ShimmerButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoggedContent;
