"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <div
      className={cn(
        "flex flex-row flex-wrap items-center gap-2",
        className
      )}
    >
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {t("talents")}:
        </span>
      )}
      {talents.map((talent) => (
        <Tooltip key={talent}>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="cursor-help select-none"
            >
              {t(`talentTitles.${talent}`)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent sideOffset={6} className="max-w-xs">
            {t(`talentEffects.${talent}`)}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
