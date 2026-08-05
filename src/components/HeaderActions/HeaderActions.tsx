"use client";

import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import LanguageSwitcher from "../LanguageSwitcher";

type Props = {
  children: React.ReactNode;
  isAuthenticated?: boolean;
};

function HeaderActions({ children, isAuthenticated = false }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isWikiPage = pathname?.startsWith("/wiki");
  const isLeaderboardPage = pathname?.startsWith("/leaderboard");
  const isFriendsPage = pathname?.startsWith("/friends");

  return (
    <div className="flex items-center gap-4">
      <LanguageSwitcher />
      {!isWikiPage && (
        <Button variant="link" asChild>
          <Link href="/wiki">{t("wiki")}</Link>
        </Button>
      )}
      {!isLeaderboardPage && (
        <Button variant="link" asChild>
          <Link href="/leaderboard">{t("leaderboard.leaders")}</Link>
        </Button>
      )}
      {isAuthenticated && !isFriendsPage && (
        <Button variant="link" asChild>
          <Link href="/friends">{t("friends")}</Link>
        </Button>
      )}
      {children}
    </div>
  );
}

export default HeaderActions;
