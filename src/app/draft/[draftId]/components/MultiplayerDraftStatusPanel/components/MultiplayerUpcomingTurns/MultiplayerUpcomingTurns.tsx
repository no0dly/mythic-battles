"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DraftSeatInfo } from "@/hooks";
import { PLAYER_ACCENT_STYLES } from "@/utils/drafts/playerAccents";

interface MultiplayerUpcomingTurnsProps {
  current: DraftSeatInfo | undefined;
  upcoming: DraftSeatInfo[];
}

export function MultiplayerUpcomingTurns({ current, upcoming }: MultiplayerUpcomingTurnsProps) {
  const { t } = useTranslation();
  if (!current) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs" data-testid="draft-upcoming-turns">
      <span className="text-muted-foreground">{t("draftUpcomingTurns")}:</span>
      {[current, ...upcoming].map((seat, index) => (
        <span key={`${seat.userId}-${index}`} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="size-3 text-muted-foreground" />}
          <span
            className={`rounded-full px-2 py-0.5 font-semibold ${PLAYER_ACCENT_STYLES[seat.accent].badge} ${
              index === 0 ? "ring-2 ring-offset-1 ring-purple-400" : "opacity-80"
            }`}
            title={seat.name}
          >
            {seat.seatLabel}
          </span>
        </span>
      ))}
    </div>
  );
}
