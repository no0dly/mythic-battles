"use client";

import { useTranslation } from "react-i18next";
import type { DraftSeatInfo } from "@/hooks";
import { PLAYER_ACCENT_STYLES } from "@/utils/drafts/playerAccents";

interface MultiplayerSeatCardProps {
  seat: DraftSeatInfo;
  isCurrentUser: boolean;
  costOverrides: Map<string, number>;
}

export function MultiplayerSeatCard({ seat, isCurrentUser, costOverrides }: MultiplayerSeatCardProps) {
  const { t } = useTranslation();
  const accentStyles = PLAYER_ACCENT_STYLES[seat.accent];
  const isPicking = seat.isTurn && seat.remaining > 0;

  const status = seat.isReady
    ? t("readyConfirmed")
    : seat.remaining <= 0
      ? ""
      : isPicking
        ? t("picking")
        : t("awaits");

  return (
    <div data-testid={`draft-seat-${seat.seatLabel}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${accentStyles.badge}`}
          >
            {seat.seatLabel}
          </span>
          <h4 className={`truncate font-semibold text-sm ${accentStyles.title}`}>
            {seat.name}
            {isCurrentUser && ` (${t("draftSeatYou")})`}
          </h4>
          {seat.team !== null && (
            <span className={`shrink-0 rounded px-1.5 text-[10px] font-semibold ${accentStyles.badge}`}>
              {t("draftTeamLabel", { number: seat.team })}
            </span>
          )}
          {status && <span className="shrink-0 text-xs text-muted-foreground">{status}</span>}
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {t("availablePoints")} ({seat.remaining})
        </p>
      </div>
      <div
        className={`border-2 rounded-lg p-2 h-[14vh] flex flex-col ${
          isPicking ? accentStyles.turnBorder : "border-gray-300"
        } ${seat.isReady ? "bg-green-500/10" : ""}`}
      >
        <div className="flex-1 overflow-y-auto space-y-1 touch-scroll-y">
          {seat.cards.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("noCardsPicked")}</p>
          ) : (
            seat.cards.map((card, index) => (
              <p key={`${card.id}-${index}`} className="text-xs">
                {index + 1} {card.unit_name} - {t(`cardType.${card.unit_type}`)},{" "}
                {costOverrides.get(card.id) ?? card.cost}
              </p>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>
          {t("strategicValue")}: {seat.strategicValue}
        </span>
      </div>
    </div>
  );
}
