"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { InfoPopup, INFO_POPUP_TRIGGER_CLASS } from "@/components/InfoPopup";
import { cn } from "@/lib/utils";

interface TalentBadgesProps {
  talents: string[];
  showLabel?: boolean;
  className?: string;
}

export function TalentBadges({
  talents,
  showLabel = true,
  className,
}: TalentBadgesProps) {
  const { t } = useTranslation();

  if (!talents?.length) {
    return null;
  }

  return (
    <span
      className={cn("flex flex-row flex-wrap items-center gap-2", className)}
    >
      {showLabel && <strong>{t("talents")}:</strong>}
      {talents.map((talent) => (
        <InfoPopup key={talent} content={t(`talentEffects.${talent}`)}>
          <Badge variant="secondary" className={INFO_POPUP_TRIGGER_CLASS}>
            {t(`talentTitles.${talent}`)}
          </Badge>
        </InfoPopup>
      ))}
    </span>
  );
}
