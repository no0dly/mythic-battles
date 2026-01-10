import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/constants";

/**
 * Configuration for draft pool generation (snake_case, matches database format)
 */

/**
 * Cards organized by type for efficient selection
 */
export type CardsByType = {
  titans: Card[];
  gods: Card[];
  monsters: Card[];
  heroes: Card[];
  troops: Card[];
  troop_attachments: Card[];
};

/**
 * Result of draft pool generation
 */
export type DraftPoolResult = {
  cardIds: string[];
  totalCost: number;
  selectedCount: number;
};

/**
 * Type guard to check if a card is of a specific type
 */
export function isCardType(card: Card, type: keyof typeof CARD_TYPES): boolean {
  return card.unit_type === CARD_TYPES[type];
}

