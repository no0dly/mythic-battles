"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { InfoPopup, INFO_POPUP_TRIGGER_CLASS } from "@/components/InfoPopup";
import { cn } from "@/lib/utils";
import type { CardClass } from "@/types/database.types";

interface ClassBadgesProps {
  classes: CardClass[];
  showLabel?: boolean;
  className?: string;
}

export function ClassBadges({
  classes,
  showLabel = true,
  className,
}: ClassBadgesProps) {
  const { t } = useTranslation();

  if (!classes?.length) {
    return null;
  }

  return (
    <span
      className={cn("flex flex-row flex-wrap items-center gap-2", className)}
    >
      {showLabel && <strong>{t("class")}:</strong>}
      {classes.map((cardClass) => (
        <InfoPopup key={cardClass} content={t(`classEffects.${cardClass}`)}>
          <Badge variant="cardClass" className={INFO_POPUP_TRIGGER_CLASS}>
            {t(`classTitles.${cardClass}`)}
          </Badge>
        </InfoPopup>
      ))}
    </span>
  );
}
