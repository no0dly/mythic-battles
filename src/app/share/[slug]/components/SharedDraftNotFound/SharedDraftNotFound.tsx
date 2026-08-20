"use client";

import { useTranslation } from "react-i18next";
import type { SharedDraftNotFoundProps } from "./types";

export default function SharedDraftNotFound({
  message,
}: SharedDraftNotFoundProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="mb-2 text-lg font-semibold text-destructive">
          {t("error")}
        </p>
        <p className="text-muted-foreground">
          {message ?? t("sharedDraftNotFound")}
        </p>
      </div>
    </div>
  );
}
