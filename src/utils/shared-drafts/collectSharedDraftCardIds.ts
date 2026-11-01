import type { SharedDraftArmy, SharedDraftArmyEntry } from "@/types/database.types";

export const collectArmiesCardIds = (armies: SharedDraftArmyEntry[]): string[] => [
  ...new Set(armies.flatMap((army) => army.card_ids)),
];

export const collectSharedDraftCardIds = (
  army: SharedDraftArmy,
): string[] => {
  const ids = new Set<string>([
    ...army.player1_card_ids,
    ...army.player2_card_ids,
  ]);
  return [...ids];
};
