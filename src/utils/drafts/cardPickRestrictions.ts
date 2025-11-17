import type { Card } from '@/types/database.types';
import { CARD_TYPES } from '@/types/constants';

/**
 * Result of card pick restriction check
 */
export interface CardPickRestrictions {
  canPick: boolean;
  reason?: string; // translation key
}

/**
 * Statistics about player's picked cards
 */
export interface PlayerCardStats {
  godCards: Card[];
  monsterCards5Cost: Card[];
  monsterCardsLess5Cost: Card[];
  otherCards: Card[];
  totalCost: number;
  remainingPoints: number;
}

/**
 * Analyzes player's picked cards and returns statistics
 * @param playerCards - array of cards picked by the player
 * @param allowedPoints - maximum number of points
 * @returns object with player's card statistics
 */
const getPlayerCardStats = (
  playerCards: Card[],
  allowedPoints: number
): PlayerCardStats => {
  const godCards: Card[] = [];
  const monsterCards5Cost: Card[] = [];
  const monsterCardsLess5Cost: Card[] = [];
  const otherCards: Card[] = [];
  let totalCost = 0;

  // Filter cards by types and cost
  playerCards.forEach((card) => {
    totalCost += card.cost;

    if (card.unit_type === CARD_TYPES.GOD) {
      godCards.push(card);
    } else if (card.unit_type === CARD_TYPES.MONSTER) {
      if (card.cost === 5) {
        monsterCards5Cost.push(card);
      } else {
        monsterCardsLess5Cost.push(card);
      }
    } else {
      otherCards.push(card);
    }
  });

  // Calculate remaining points
  const remainingPoints = allowedPoints - totalCost;

  return {
    godCards,
    monsterCards5Cost,
    monsterCardsLess5Cost,
    otherCards,
    totalCost,
    remainingPoints,
  };
};

/**
 * Finds the minimum cost of God cards from available cards
 * @param availableCards - cards available in the current draft pool
 * @returns minimum cost of a God card, or null if no God cards available
 */
const getMinGodCardCost = (availableCards: Card[]): number | null => {
  const godCards = availableCards.filter(
    (card) => card.unit_type === CARD_TYPES.GOD
  );

  if (godCards.length === 0) {
    return null;
  }

  return Math.min(...godCards.map((card) => card.cost));
};

/**
 * Checks if a player can pick a card
 * @param card - card to check
 * @param playerCards - cards already picked by the player
 * @param allowedPoints - maximum number of points
 * @param availableCards - cards available in the current draft pool
 * @returns object with check result and restriction reason
 */
export const canPickCard = (
  card: Card,
  playerCards: Card[],
  allowedPoints: number,
  availableCards: Card[]
): CardPickRestrictions => {
  const stats = getPlayerCardStats(playerCards, allowedPoints);

  // Check 1: Enough points
  if (card.cost > stats.remainingPoints) {
    return {
      canPick: false,
      reason: 'notEnoughPoints',
    };
  }

  // Check 2: God card limit
  if (card.unit_type === CARD_TYPES.GOD) {
    if (stats.godCards.length >= 1) {
      return {
        canPick: false,
        reason: 'godCardLimitReached',
      };
    }
  }

  // Check 3: Monster card with cost 5 limit
  if (card.unit_type === CARD_TYPES.MONSTER && card.cost === 5) {
    if (stats.monsterCards5Cost.length >= 1) {
      return {
        canPick: false,
        reason: 'monster5CostLimitReached',
      };
    }
  }

  // Check 4: Mandatory God card - ensure player has enough points left for God card
  // If player hasn't picked a God card yet, and picking this card would leave
  // less points than the cheapest available God card, prevent the pick
  if (stats.godCards.length === 0 && card.unit_type !== CARD_TYPES.GOD) {
    const minGodCardCost = getMinGodCardCost(availableCards);
    
    if (minGodCardCost !== null) {
      const pointsAfterPick = stats.remainingPoints - card.cost;
      if (pointsAfterPick < minGodCardCost) {
        return {
          canPick: false,
          reason: 'mustReservePointsForGod',
        };
      }
    }
  }

  // Check 5: Hero, Troop, Titan - no limits
  // Monster < 5 - no limits

  return { canPick: true };
};

/**
 * Checks if a player can start the game
 * @param playerCards - cards picked by the player
 * @param allowedPoints - maximum number of points
 * @returns object with check result and restriction reason
 */
export const canStartGame = (
  playerCards: Card[],
  allowedPoints: number
): CardPickRestrictions => {
  const stats = getPlayerCardStats(playerCards, allowedPoints);

  // Check 1: Must have a God card
  if (stats.godCards.length === 0) {
    return {
      canPick: false,
      reason: 'mustPickGodCard',
    };
  }

  // Check 2: Must have 0 remaining points
  if (stats.remainingPoints !== 0) {
    return {
      canPick: false,
      reason: 'mustUseAllPoints',
    };
  }

  return { canPick: true };
};

export { getPlayerCardStats };

