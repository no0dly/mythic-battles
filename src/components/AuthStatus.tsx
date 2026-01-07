"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

type Props = {
  userEmail: string | null;
  onLinkClick?: () => void;
};

export function AuthStatus({ userEmail, onLinkClick }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <Button variant="link" asChild>
        {userEmail ? (
          <Link href="/profile" onClick={onLinkClick}>
            {userEmail}
          </Link>
        ) : (
          <Link href="/auth/login" onClick={onLinkClick}>
            {t("login")}
          </Link>
        )}
      </Button>
    </div>
  );
}
