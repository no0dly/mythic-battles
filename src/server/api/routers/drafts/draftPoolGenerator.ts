import type { Card } from "@/types/database.types";
import type { DraftPoolResult } from "./types";
import {
  organizeCardsByType,
  pickRandom,
  handleSpecialCase,
  selectAffordableCard,
} from "./helpers";
import { MAX_DRAFT_ITERATIONS, SPECIAL_CASE_UNITS } from "./constants";
import { DraftPoolConfig } from "@/types/draft-settings.types";

type CardSelectionResult = {
  selectedIds: string[];
  remainingCards: Card[];
};

type SpecialCaseHandler = (card: Card, remainingCards: Card[]) => Card[];

/**
 * Generic function to select a fixed number of cards from a pool
 */
function selectFixedAmountCards(
  availableCards: Card[],
  amount: number,
  onSelect?: (card: Card, remainingCards: Card[]) => Card[]
): CardSelectionResult {
  const selectedIds: string[] = [];
  let remainingCards = [...availableCards];

  for (let i = 0; i < amount && remainingCards.length > 0; i++) {
    const pick = pickRandom(remainingCards);
    if (!pick) break;

    selectedIds.push(pick.item.id);
    remainingCards = pick.remaining;

    if (onSelect) {
      remainingCards = onSelect(pick.item, remainingCards);
    }
  }

  return { selectedIds, remainingCards };
}

/**
 * Select titans and handle special cases (remove corresponding monsters)
 */
function selectTitans(
  availableTitans: Card[],
  titansAmount: number,
  availableMonsters: Card[]
): {
  selectedTitanIds: string[];
  remainingMonsters: Card[];
} {
  const selectedTitanIds: string[] = [];
  let remainingTitans = [...availableTitans];
  let remainingMonsters = [...availableMonsters];

  for (let i = 0; i < titansAmount && remainingTitans.length > 0; i++) {
    const pick = pickRandom(remainingTitans);
    if (!pick) break;

    selectedTitanIds.push(pick.item.id);
    remainingTitans = pick.remaining;
    remainingMonsters = handleSpecialCase(
      pick.item,
      remainingMonsters,
      SPECIAL_CASE_UNITS.TITAN_MONSTER_PAIRS
    );
  }

  return { selectedTitanIds, remainingMonsters };
}

/**
 * Select gods for the draft pool
 */
function selectGods(
  availableGods: Card[],
  godsAmount: number
): {
  selectedGodIds: string[];
} {
  const { selectedIds } = selectFixedAmountCards(availableGods, godsAmount);
  return { selectedGodIds: selectedIds };
}

/**
 * Select troop attachments for the draft pool
 */
function selectTroopAttachments(
  availableTroopAttachments: Card[],
  troopAttachmentAmount: number
): {
  selectedTroopAttachmentIds: string[];
} {
  const { selectedIds } = selectFixedAmountCards(availableTroopAttachments, troopAttachmentAmount);
  return { selectedTroopAttachmentIds: selectedIds };
}

type SelectionState = {
  selectedIds: string[];
  size: number;
  cardPools: {
    monsters: Card[];
    heroes: Card[];
    troops: Card[];
  };
};

type CardTypeConfig = {
  key: keyof SelectionState["cardPools"];
  specialCaseHandler?: SpecialCaseHandler;
};

/**
 * Attempt to select a card from a given pool
 */
function attemptCardSelection(
  pool: Card[],
  state: SelectionState,
  draftSize: number,
  specialCaseHandler?: SpecialCaseHandler
): { success: boolean; updatedPool: Card[] } {
  if (pool.length === 0) {
    return { success: false, updatedPool: pool };
  }

  const selection = selectAffordableCard(pool, state.size, draftSize);
  if (!selection) {
    return { success: false, updatedPool: pool };
  }

  let updatedPool = selection.remaining;

  if (selection.added) {
    state.selectedIds.push(selection.card.id);
    state.size += selection.card.cost;
  }

  if (specialCaseHandler) {
    updatedPool = specialCaseHandler(selection.card, updatedPool);
  }

  return { success: selection.added, updatedPool };
}

/**
 * Check if we can still make progress with available cards
 */
function canMakeProgress(cardPools: SelectionState["cardPools"]): boolean {
  return (
    cardPools.monsters.length > 0 ||
    cardPools.heroes.length > 0 ||
    cardPools.troops.length > 0
  );
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
  const state: SelectionState = {
    selectedIds: [],
    size: currentSize,
    cardPools: {
      monsters: [...availableMonsters],
      heroes: [...availableHeroes],
      troops: [...availableTroops],
    },
  };

  const cardTypeConfigs: CardTypeConfig[] = [
    { key: "monsters" },
    {
      key: "heroes",
      specialCaseHandler: (card, remainingCards) =>
        handleSpecialCase(card, remainingCards, SPECIAL_CASE_UNITS.HERO_VARIANTS),
    },
    { key: "troops" },
  ];

  let iterations = 0;

  while (state.size < draftSize && iterations < MAX_DRAFT_ITERATIONS) {
    iterations++;
    let madeProgress = false;

    // Try each card type in order
    for (const config of cardTypeConfigs) {
      const pool = state.cardPools[config.key];
      const result = attemptCardSelection(
        pool,
        state,
        draftSize,
        config.specialCaseHandler
      );

      state.cardPools[config.key] = result.updatedPool;

      if (result.success) {
        madeProgress = true;
      }
    }

    // Early exit: no cards available
    if (!canMakeProgress(state.cardPools)) {
      if (state.size < draftSize) {
        throw new Error("Not enough units for the draft size");
      }
      break;
    }

    // Early exit: no progress and no more cards
    if (!madeProgress) {
      break;
    }
  }

  if (iterations >= MAX_DRAFT_ITERATIONS) {
    throw new Error(
      "Draft generation exceeded maximum iterations - possible infinite loop"
    );
  }

  return {
    selectedIds: state.selectedIds,
    finalSize: state.size,
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
  // Filter out 0 cost cards
  const filteredCards = cards.filter((card) => card.cost > 0);

  // Organize cards by type
  const cardsByType = organizeCardsByType(filteredCards);

  // Select titans (and handle special cases)
  const { selectedTitanIds, remainingMonsters } = selectTitans(
    cardsByType.titans,
    config.titans_amount,
    cardsByType.monsters
  );

  // Select gods
  const { selectedGodIds } = selectGods(cardsByType.gods, config.gods_amount);

  // Select troop attachments
  const { selectedTroopAttachmentIds } = selectTroopAttachments(
    cardsByType.troop_attachments,
    config.troop_attachment_amount
  );

  // Fill remaining draft size with monsters, heroes, and troops
  // Note: Titans, gods, and troop attachments are "free" - they don't count toward the draft_size cost limit.
  // The draft_size is the cost budget ONLY for monsters, heroes, and troops.
  // This matches the game rules where titans, gods, and troop attachments are special units that don't consume the draft budget.
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
    ...selectedTroopAttachmentIds,
    ...remainingIds,
  ];

  return {
    cardIds: allSelectedIds,
    totalCost: finalSize,
    selectedCount: allSelectedIds.length,
  };
}

