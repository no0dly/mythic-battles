import type { DraftPick, SharedDraftArmy, SharedDraftArmyEntry } from "@/types/database.types";
import { zCardIds, zSharedDraftArmies, zSharedDraftHistory } from "./schemas";

export const parseCardIds = (value: unknown): string[] => {
  const parsed = zCardIds.safeParse(value);
  return parsed.success ? parsed.data : [];
};

export const parseSharedDraftArmy = (
  player1CardIds: unknown,
  player2CardIds: unknown,
): SharedDraftArmy => ({
  player1_card_ids: parseCardIds(player1CardIds),
  player2_card_ids: parseCardIds(player2CardIds),
});

/** Multiplayer snapshots store `armies`; 1v1 snapshots fall back to the two legacy columns. */
export const parseSharedDraftArmies = (
  armies: unknown,
  legacy: SharedDraftArmy,
): SharedDraftArmyEntry[] => {
  const parsed = zSharedDraftArmies.safeParse(armies);
  if (parsed.success && parsed.data.length > 0) return parsed.data;
  return [
    { card_ids: legacy.player1_card_ids },
    { card_ids: legacy.player2_card_ids },
  ];
};

/** Snapshots published before history was stored have no picks. */
export const parseSharedDraftPicks = (history: unknown): DraftPick[] => {
  const parsed = zSharedDraftHistory.safeParse(history);
  return parsed.success ? parsed.data.picks : [];
};
