"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { InfoPopup, INFO_POPUP_TRIGGER_CLASS } from "@/components/InfoPopup";
import { cn } from "@/lib/utils";
import type { MapType } from "@/types/database.types";

interface MapTypeBadgesProps {
  mapTypes: MapType[];
  showLabel?: boolean;
  className?: string;
}

export function MapTypeBadges({
  mapTypes,
  showLabel = true,
  className,
}: MapTypeBadgesProps) {
  const { t } = useTranslation();

  if (!mapTypes?.length) {
    return null;
  }

  return (
    <span
      className={cn("flex flex-row flex-wrap items-center gap-2", className)}
    >
      {showLabel && <strong>{t("mapType")}:</strong>}
      {mapTypes.map((mapType) => (
        <InfoPopup key={mapType} content={t(`mapTypeEffects.${mapType}`)}>
          <Badge variant="mapType" className={INFO_POPUP_TRIGGER_CLASS}>
            {t(`mapTypeTitles.${mapType}`)}
          </Badge>
        </InfoPopup>
      ))}
    </span>
  );
}
