import type { SharedDraftArmy } from "@/types/database.types";
import { zCardIds } from "./schemas";

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
