"use client";

import { useTranslation } from "react-i18next";
import { formatDisplayName } from "@/utils/users";
import type { Card, DraftPick, UserSubset } from "@/types/database.types";
import { PlayerAvatar } from "../PlayerAvatar";
import { cn } from "@/lib/utils";
import { PLAYER_ACCENTS, type PlayerAccent } from "./constants";

export type DraftPoolRailPick = {
  pick: DraftPick;
  card: Card | undefined;
};

interface DraftPoolPlayerRailProps {
  user: UserSubset | undefined;
  fallbackName: string;
  picks: DraftPoolRailPick[];
  totalCost: number;
  accent: PlayerAccent;
  activeCardId: string | null;
  activePickNumber: number | null;
  onPickClick: (cardId: string, pickNumber: number) => void;
}

export function DraftPoolPlayerRail({
  user,
  fallbackName,
  picks,
  totalCost,
  accent,
  activeCardId,
  activePickNumber,
  onPickClick,
}: DraftPoolPlayerRailProps) {
  const { t } = useTranslation();
  const styles = PLAYER_ACCENTS[accent];
  const displayName = user
    ? formatDisplayName(user.display_name, user.email)
    : fallbackName;

  return (
    <aside
      className={cn(
        "hidden h-full w-56 shrink-0 flex-col overflow-hidden rounded-xl border-2 md:flex",
        styles.rail
      )}
    >
      <div className="shrink-0 border-b border-black/5 p-3">
        <div className="flex items-center gap-2">
          {user ? <PlayerAvatar {...user} size="sm" /> : null}
          <div className="min-w-0">
            <p className={cn("truncate text-sm font-semibold", styles.title)}>
              {displayName}
            </p>
            <p className="text-xs text-gray-600">
              {picks.length} {t("picks")}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-gray-700">
          {t("totalCost")}: {totalCost}
        </p>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {picks.length === 0 ? (
          <li className="px-2 py-3 text-center text-xs text-gray-500">
            {t("noCardsPicked")}
          </li>
        ) : (
          picks.map(({ pick, card }) => {
            const isActive =
              activeCardId === pick.card_id &&
              (activePickNumber === pick.pick_number ||
                activePickNumber === null);

            return (
              <li key={`${pick.pick_number}-${pick.card_id}`}>
                <button
                  type="button"
                  onClick={() => onPickClick(pick.card_id, pick.pick_number)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition",
                    styles.row,
                    isActive ? styles.rowActive : null
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      styles.badge
                    )}
                  >
                    {pick.pick_number}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                    {card?.unit_name ?? t("unknownCard")}
                  </span>
                  {pick.auto ? (
                    <span className="shrink-0 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      {t("autoPick")}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
