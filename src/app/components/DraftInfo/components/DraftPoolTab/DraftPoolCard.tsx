"use client";

import { useTranslation } from "react-i18next";
import type { Card, DraftPick } from "@/types/database.types";
import { CardImage } from "../CardImage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { draftPoolCardElementId, playerAccentStyles } from "./constants";

interface DraftPoolCardProps {
  card: Card;
  picks: DraftPick[];
  player1Id: string;
  isHighlighted: boolean;
  onClick: () => void;
}

export function DraftPoolCard({
  card,
  picks,
  player1Id,
  isHighlighted,
  onClick,
}: DraftPoolCardProps) {
  const { t } = useTranslation();
  const isPicked = picks.length > 0;
  const accent = playerAccentStyles(picks[0]?.player_id === player1Id);

  return (
    <button
      type="button"
      id={draftPoolCardElementId(card.id)}
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 bg-white p-2 text-left shadow-sm transition hover:shadow-md",
        isPicked ? accent.ring : "border-gray-200 opacity-55 hover:opacity-80",
        isHighlighted
          ? cn("ring-4 ring-offset-2 animate-pulse", accent.highlight)
          : null
      )}
    >
      <div className="relative mx-auto w-max">
        <CardImage card={card} size="md" />
        {isPicked ? (
          <div className="absolute left-1 top-1 flex flex-col gap-0.5">
            {picks.map((pick) => (
              <span
                key={`${pick.pick_number}-${pick.card_id}`}
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow",
                  playerAccentStyles(pick.player_id === player1Id).badge
                )}
              >
                #{pick.pick_number}
                {pick.auto ? (
                  <span className="font-semibold uppercase opacity-90">
                    {t("autoPick")}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-2 space-y-1">
        <p
          className="truncate text-sm font-semibold text-gray-900"
          title={card.unit_name}
        >
          {card.unit_name}
        </p>
        <div className="flex items-center justify-between gap-1">
          <Badge variant={card.unit_type} className="text-[10px]">
            {t(`cardType.${card.unit_type}`)}
          </Badge>
          <span className="text-xs font-bold text-purple-600">
            {t("cost")}: {card.cost}
          </span>
        </div>
      </div>
    </button>
  );
}
