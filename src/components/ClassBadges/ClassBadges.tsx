"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <div
      className={cn(
        "flex flex-row flex-wrap items-center gap-2",
        className
      )}
    >
      {showLabel && (
        <strong>{t("class")}:</strong>
      )}
      {classes.map((cardClass) => (
        <Tooltip key={cardClass}>
          <TooltipTrigger asChild>
            <Badge
              variant="cardClass"
              className="cursor-help select-none"
            >
              {t(`classTitles.${cardClass}`)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent sideOffset={6} className="max-w-xs">
            {t(`classEffects.${cardClass}`)}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
