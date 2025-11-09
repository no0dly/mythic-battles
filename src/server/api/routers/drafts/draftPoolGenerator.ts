import type { Card } from "@/types/database.types";
import type { DraftPoolResult } from "./types";
import {
  organizeCardsByType,
  pickRandom,
  handleTitanSpecialCase,
  handleHeroSpecialCase,
  selectAffordableCard,
} from "./helpers";
import { MAX_DRAFT_ITERATIONS } from "./constants";
import { DraftPoolConfig } from "@/types/draft-settings.types";

// Note: We use regular Error instead of custom class for simplicity
// The router can check error messages to determine error type

/**
 * Select titans for the draft pool
 */
function selectTitans(
  availableTitans: Card[],
  titansAmount: number,
  availableMonsters: Card[]
): {
  selectedTitanIds: string[];
  remainingTitans: Card[];
  remainingMonsters: Card[];
} {
  const selectedTitanIds: string[] = [];
  let remainingTitans = [...availableTitans];
  let remainingMonsters = [...availableMonsters];

  for (let i = 0; i < titansAmount && remainingTitans.length > 0; i++) {
    const pick = pickRandom(remainingTitans);
    if (!pick) break;

    const titan = pick.item;
    selectedTitanIds.push(titan.id);
    remainingTitans = pick.remaining;

    // Handle special cases (remove corresponding monsters)
    remainingMonsters = handleTitanSpecialCase(titan, remainingMonsters);
  }

  return {
    selectedTitanIds,
    remainingTitans,
    remainingMonsters,
  };
}

/**
 * Select gods for the draft pool
 */
function selectGods(
  availableGods: Card[],
  godsAmount: number
): {
  selectedGodIds: string[];
  remainingGods: Card[];
} {
  const selectedGodIds: string[] = [];
  let remainingGods = [...availableGods];

  for (let i = 0; i < godsAmount && remainingGods.length > 0; i++) {
    const pick = pickRandom(remainingGods);
    if (!pick) break;

    selectedGodIds.push(pick.item.id);
    remainingGods = pick.remaining;
  }

  return {
    selectedGodIds,
    remainingGods,
  };
}

/**
 * Fill remaining draft size with monsters, heroes, and troops
 */
function fillRemainingDraftSize(
  availableMonsters: Card[],
  availableHeroes: Card[],
  availableTroops: Card[],
  currentSize: number,
  draftSize: number
): {
  selectedIds: string[];
  finalSize: number;
} {
  const selectedIds: string[] = [];
  let remainingMonsters = [...availableMonsters];
  let remainingHeroes = [...availableHeroes];
  let remainingTroops = [...availableTroops];
  let size = currentSize;
  let iterations = 0;

  while (size < draftSize && iterations < MAX_DRAFT_ITERATIONS) {
    iterations++;
    let madeProgress = false;

    // Try to select a monster
    if (remainingMonsters.length > 0) {
      const selection = selectAffordableCard(remainingMonsters, size, draftSize);
      if (selection) {
        remainingMonsters = selection.remaining;
        if (selection.added) {
          selectedIds.push(selection.card.id);
          size += selection.card.cost;
          madeProgress = true;
        }
      }
    }

    // Try to select a hero
    if (remainingHeroes.length > 0) {
      const selection = selectAffordableCard(remainingHeroes, size, draftSize);
      if (selection) {
        remainingHeroes = selection.remaining;

        if (selection.added) {
          selectedIds.push(selection.card.id);
          size += selection.card.cost;
          madeProgress = true;
        }

        // Handle special cases (remove other hero variants)
        remainingHeroes = handleHeroSpecialCase(selection.card, remainingHeroes);
      }
    }

    // Try to select a troop
    if (remainingTroops.length > 0) {
      const selection = selectAffordableCard(remainingTroops, size, draftSize);
      if (selection) {
        remainingTroops = selection.remaining;
        if (selection.added) {
          selectedIds.push(selection.card.id);
          size += selection.card.cost;
          madeProgress = true;
        }
      }
    } else {
      // No troops left - check if we can still make progress
      if (remainingMonsters.length === 0 && remainingHeroes.length === 0) {
        if (size < draftSize) {
          throw new Error("Not enough units for the draft size");
        }
        break;
      }
    }

    // If no progress made and no more units available, break
    if (
      !madeProgress &&
      remainingMonsters.length === 0 &&
      remainingHeroes.length === 0 &&
      remainingTroops.length === 0
    ) {
      break;
    }
  }

  if (iterations >= MAX_DRAFT_ITERATIONS) {
    throw new Error(
      "Draft generation exceeded maximum iterations - possible infinite loop"
    );
  }

  return {
    selectedIds,
    finalSize: size,
  };
}

/**
 * Generate a draft pool of cards based on the configuration
 * Implements the same logic as Draft.py
 *
 * @param cards - All available cards
 * @param config - Draft pool configuration
 * @returns Draft pool result with card IDs, total cost, and count
 */
export function generateDraftPool(
  cards: Card[],
  config: DraftPoolConfig
): DraftPoolResult {
  // Organize cards by type
  const cardsByType = organizeCardsByType(cards);

  // Select titans (and handle special cases)
  const { selectedTitanIds, remainingMonsters } = selectTitans(
    cardsByType.titans,
    config.titans_amount,
    cardsByType.monsters
  );

  // Select gods
  const { selectedGodIds } = selectGods(cardsByType.gods, config.gods_amount);

  // Fill remaining draft size with monsters, heroes, and troops
  // Note: Titans and gods are "free" - they don't count toward the draft_size cost limit.
  // The draft_size is the cost budget ONLY for monsters, heroes, and troops.
  // This matches the game rules where titans and gods are special units that don't consume the draft budget.
  const { selectedIds: remainingIds, finalSize } = fillRemainingDraftSize(
    remainingMonsters,
    cardsByType.heroes,
    cardsByType.troops,
    0, // Start from 0 because we only count costs of monsters/heroes/troops
    config.draft_size
  );

  // Combine all selected IDs
  const allSelectedIds = [
    ...selectedTitanIds,
    ...selectedGodIds,
    ...remainingIds,
  ];

  return {
    cardIds: allSelectedIds,
    totalCost: finalSize,
    selectedCount: allSelectedIds.length,
  };
}

