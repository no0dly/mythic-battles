"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <div
      className={cn(
        "flex flex-row flex-wrap items-center gap-2",
        className
      )}
    >
      {showLabel && (
        <strong>{t("mapType")}:</strong>
      )}
      {mapTypes.map((mapType) => (
        <Tooltip key={mapType}>
          <TooltipTrigger asChild>
            <Badge
              variant="mapType"
              className="cursor-help select-none"
            >
              {t(`mapTypeTitles.${mapType}`)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent sideOffset={6} className="max-w-xs">
            {t(`mapTypeEffects.${mapType}`)}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
