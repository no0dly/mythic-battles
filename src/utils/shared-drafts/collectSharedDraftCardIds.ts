import type { SharedDraftArmy } from "@/types/database.types";

export const collectSharedDraftCardIds = (
  army: SharedDraftArmy,
): string[] => {
  const ids = new Set<string>([
    ...army.player1_card_ids,
    ...army.player2_card_ids,
  ]);
  return [...ids];
};
