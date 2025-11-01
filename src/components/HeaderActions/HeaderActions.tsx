"use client";

import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

function HeaderActions({ children }: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isWikiPage = pathname?.startsWith("/wiki");

  return (
    <div className="flex items-center gap-4">
      {!isWikiPage && (
        <Button variant="link" asChild>
          <Link href="/wiki">{t("wiki")}</Link>
        </Button>
      )}
      {children}
    </div>
  );
}

export default HeaderActions;
