import type { Card } from "@/types/database.types";

export const totalCardCost = (cards: Card[]): number =>
  cards.reduce((sum, card) => sum + card.cost, 0);
