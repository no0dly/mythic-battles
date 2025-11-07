"use client";
import { useTranslation } from "react-i18next";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useRouter } from "next/navigation";

function NotLoggedContent() {
  const { t } = useTranslation();
  const router = useRouter();

  const onLoginHandler = () => {
    router.push("/auth/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 sm:py-12">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
        {t("welcome")}
      </h2>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-center max-w-md px-4">
        {t("loginToGetStarted")}
      </p>
      <ShinyButton
        onClick={onLoginHandler}
        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
      >
        {t("login")}
      </ShinyButton>
    </div>
  );
}

export default NotLoggedContent;
