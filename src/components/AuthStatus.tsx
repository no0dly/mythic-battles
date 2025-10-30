"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

type Props = {
  userEmail: string | null;
};

export function AuthStatus({ userEmail }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <Button variant="link" asChild>
        {userEmail ? (
          <Link href="/profile">{userEmail}</Link>
        ) : (
          <Link href="/auth/login">{t("login")}</Link>
        )}
      </Button>
    </div>
  );
}
