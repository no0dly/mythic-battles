"use client";

import { useState, useCallback } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { AuthStatus } from "@/components/AuthStatus";
interface MobileMenuProps {
  userEmail: string | null;
}

export function MobileMenu({ userEmail }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const pathname = usePathname();
  const isWikiPage = pathname?.startsWith("/wiki");
  const isLeaderboardPage = pathname?.startsWith("/leaderboard");

  const handleToggleMenu = (value: boolean) => () => setIsOpen(value);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={handleToggleMenu(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("menu")}</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-4 p-6">
            {/* User Info */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t("userInfo")}
              </div>
              <AuthStatus
                userEmail={userEmail}
                onLinkClick={handleToggleMenu(false)}
              ></AuthStatus>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Navigation Links */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t("navigation")}
              </div>
              <div className="flex flex-col gap-2">
                {!isWikiPage && (
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/wiki" onClick={handleToggleMenu(false)}>
                      {t("wiki")}
                    </Link>
                  </Button>
                )}
                {!isLeaderboardPage && (
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/leaderboard" onClick={handleToggleMenu(false)}>
                      {t("leaderboard.leaders")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Language Switcher */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t("language")}
              </div>
              <div className="flex items-center">
                <LanguageSwitcher onLanguageChange={handleToggleMenu(false)} />
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
