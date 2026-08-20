import type { Card } from "@/types/database.types";
import { createCardIdMap } from "@/utils/cards/createCardIdMap";

export const cardsInListedOrder = (
  ids: string[],
  cards: Card[] | undefined,
): Card[] => {
  const cardsMap = createCardIdMap(cards);
  const ordered: Card[] = [];

  ids.forEach((id) => {
    const card = cardsMap.get(id);
    if (card) {
      ordered.push(card);
    }
  });

  return ordered;
};
