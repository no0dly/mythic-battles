import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/constants";
import type { CardsByType } from "./types";
import { SPECIAL_CASE_UNITS } from "./constants";

/**
 * Organize cards by type for efficient filtering
 */
export function organizeCardsByType(cards: Card[]): CardsByType {
  return {
    titans: cards.filter((card) => card.unit_type === CARD_TYPES.TITAN),
    gods: cards.filter((card) => card.unit_type === CARD_TYPES.GOD),
    monsters: cards.filter((card) => card.unit_type === CARD_TYPES.MONSTER),
    heroes: cards.filter((card) => card.unit_type === CARD_TYPES.HERO),
    troops: cards.filter((card) => card.unit_type === CARD_TYPES.TROOP),
  };
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
 * Handle special case: when a titan is selected, remove corresponding monster
 */
export function handleTitanSpecialCase(
  titan: Card,
  availableMonsters: Card[]
): Card[] {
  const matchingName = SPECIAL_CASE_UNITS.TITAN_MONSTER_PAIRS.find((name) =>
    titan.unit_name.includes(name)
  );

  if (!matchingName) {
    return availableMonsters;
  }

  return removeSpecialCaseCards(availableMonsters, [matchingName]);
}

/**
 * Handle special case: when a hero variant is selected, remove other variants
 */
export function handleHeroSpecialCase(
  hero: Card,
  availableHeroes: Card[]
): Card[] {
  const matchingName = SPECIAL_CASE_UNITS.HERO_VARIANTS.find((name) =>
    hero.unit_name.includes(name)
  );

  if (!matchingName) {
    return availableHeroes;
  }

  return removeSpecialCaseCards(availableHeroes, [matchingName]);
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

  if (affordableCards.length === 0) {
    // No affordable cards, but still remove one to make progress
    const pick = pickRandom(cards);
    if (!pick) return null;
    return { card: pick.item, remaining: pick.remaining, added: false };
  }

  // Pick from affordable cards
  const pick = pickRandom(affordableCards);
  if (!pick) return null;

  // Remove from original array
  const remaining = cards.filter((card) => card.id !== pick.item.id);

  return { card: pick.item, remaining, added: true };
}

