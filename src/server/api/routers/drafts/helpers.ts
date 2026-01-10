import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/constants";
import type { CardsByType } from "./types";

/**
 * Reverse lookup map: card type value -> result key
 * Enables O(1) lookup instead of iterating through all types
 */
const TYPE_TO_KEY_MAP: Record<string, keyof CardsByType> = {
  [CARD_TYPES.TITAN]: "titans",
  [CARD_TYPES.GOD]: "gods",
  [CARD_TYPES.MONSTER]: "monsters",
  [CARD_TYPES.HERO]: "heroes",
  [CARD_TYPES.TROOP]: "troops",
  [CARD_TYPES.TROOP_ATTACHMENT]: "troop_attachments",
} as const;

/**
 * Organize cards by type for efficient filtering
 * Uses a single pass through the cards array with O(1) type lookup
 */
export function organizeCardsByType(cards: Card[]): CardsByType {
  const result: CardsByType = {
    titans: [],
    gods: [],
    monsters: [],
    heroes: [],
    troops: [],
    troop_attachments: [],
  };

  // Single pass through all cards with O(1) lookup
  for (const card of cards) {
    const key = TYPE_TO_KEY_MAP[card.unit_type];
    if (key) {
      result[key].push(card);
    }
  }

  return result;
}

/**
 * Get a random element from an array and remove it
 * Returns the element and the modified array
 */
export function pickRandom<T>(array: T[]): { item: T; remaining: T[] } | null {
  if (array.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * array.length);
  const item = array[randomIndex]!;
  const remaining = [...array];
  remaining.splice(randomIndex, 1);

  return { item, remaining };
}

/**
 * Check if a card name contains any of the special case unit names
 */
export function containsSpecialCaseName(
  cardName: string,
  specialNames: readonly string[]
): boolean {
  return specialNames.some((name) => cardName.includes(name));
}

/**
 * Remove cards that match special case names from the list
 * Used when a variant is selected to exclude other variants
 */
export function removeSpecialCaseCards(
  cards: Card[],
  specialNames: readonly string[]
): Card[] {
  return cards.filter(
    (card) => !containsSpecialCaseName(card.unit_name, specialNames)
  );
}

/**
 * Generic function to handle special case card selection
 * Finds a matching special case name and removes corresponding cards
 */
export function handleSpecialCase(
  selectedCard: Card,
  availableCards: Card[],
  specialCasePairs: readonly string[]
): Card[] {
  const matchingName = specialCasePairs.find((name) =>
    selectedCard.unit_name.includes(name)
  );

  if (!matchingName) {
    return availableCards;
  }

  return removeSpecialCaseCards(availableCards, [matchingName]);
}


/**
 * Check if a card can fit within the remaining draft size
 */
export function canFitInDraft(card: Card, currentSize: number, draftSize: number): boolean {
  return card.cost + currentSize <= draftSize;
}

/**
 * Select a random card that fits within the budget
 * Returns the card and updated arrays
 * If no affordable cards exist, still removes one to make progress
 */
export function selectAffordableCard<T extends Card>(
  cards: T[],
  currentSize: number,
  draftSize: number
): { card: T; remaining: T[]; added: boolean } | null {
  if (cards.length === 0) {
    return null;
  }

  // Filter to only affordable cards
  const affordableCards = cards.filter((card) =>
    canFitInDraft(card, currentSize, draftSize)
  );

  // If we have affordable cards, pick from them
  if (affordableCards.length > 0) {
    const pick = pickRandom(affordableCards);
    if (!pick) return null;

    // Remove from original array
    const remaining = cards.filter((card) => card.id !== pick.item.id);
    return { card: pick.item, remaining, added: true };
  }

  // No affordable cards, but still remove one to make progress
  const pick = pickRandom(cards);
  if (!pick) return null;

  return { card: pick.item, remaining: pick.remaining, added: false };
}

