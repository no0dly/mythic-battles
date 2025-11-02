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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {t("welcome")}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {t("loginToGetStarted")}
      </p>
      <ShinyButton onClick={onLoginHandler}>{t("login")}</ShinyButton>
    </div>
  );
}

export default NotLoggedContent;
