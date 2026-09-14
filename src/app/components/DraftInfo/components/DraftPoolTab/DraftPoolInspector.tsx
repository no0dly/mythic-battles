"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Card, DraftPick, UserSubset } from "@/types/database.types";
import { formatDisplayName } from "@/utils/users";
import { CardPreviewPanel } from "../CardPreviewPanel";
import { cn } from "@/lib/utils";
import { playerAccentStyles } from "./constants";

interface DraftPoolInspectorProps {
  card: Card;
  picks: DraftPick[];
  player1Id: string;
  player1: UserSubset | undefined;
  player2: UserSubset | undefined;
  onClose: () => void;
}

export function DraftPoolInspector({
  card,
  picks,
  player1Id,
  player1,
  player2,
  onClose,
}: DraftPoolInspectorProps) {
  const { t } = useTranslation();

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-white/95 shadow-inner backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-200"
      role="dialog"
      aria-modal="false"
      aria-label={card.unit_name}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 p-3">
        <div className="min-w-0 flex-1 space-y-2">
          {picks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600">
              {t("unpicked")}
            </p>
          ) : (
            picks.map((pick) => {
              const isPlayer1 = pick.player_id === player1Id;
              const user = isPlayer1 ? player1 : player2;
              const name = user
                ? formatDisplayName(user.display_name, user.email)
                : t(isPlayer1 ? "player1" : "player2");

              return (
                <div
                  key={`${pick.pick_number}-${pick.card_id}`}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    playerAccentStyles(isPlayer1).meta
                  )}
                >
                  <p className="font-semibold">
                    {t("pickNumber", { number: pick.pick_number })}
                    {pick.auto ? ` · ${t("autoPick")}` : ""}
                  </p>
                  <p>{t("pickedBy", { name })}</p>
                  <p className="text-xs opacity-80">
                    {new Date(pick.timestamp).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
          aria-label={t("close")}
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <CardPreviewPanel card={card} />
      </div>
    </div>
  );
}
