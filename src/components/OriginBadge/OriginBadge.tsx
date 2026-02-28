"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CARD_ORIGIN_FULL_NAME } from "@/types/constants";
import type { CardOrigin } from "@/types/database.types";

interface OriginBadgeProps {
  origin: CardOrigin | null;
  showLabel?: boolean;
  className?: string;
}

export function OriginBadge({
  origin,
  showLabel = true,
  className,
}: OriginBadgeProps) {
  const { t } = useTranslation();

  if (!origin) {
    return null;
  }

  const badgeText = CARD_ORIGIN_FULL_NAME[origin];
  if (!badgeText) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-row flex-wrap items-center gap-2", className)}
    >
      {showLabel && <strong>{t("origin")}:</strong>}
      <Badge variant="cardOrigin" className="select-none">
        {badgeText}
      </Badge>
    </div>
  );
}
