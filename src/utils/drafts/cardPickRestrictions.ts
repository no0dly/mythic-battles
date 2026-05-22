import type { Card } from '@/types/database.types';
import { CARD_TYPES, isDivinityUnitType } from '@/types/constants';

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
  divinityCards: Card[];
  monsterCards5Cost: Card[];
  monsterCardsLess5Cost: Card[];
  otherCards: Card[];
  totalCost: number;
  remainingPoints: number;
}

export const hasDivinityPicked = (playerCards: Card[]): boolean =>
  playerCards.some((card) => isDivinityUnitType(card.unit_type));

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
  const divinityCards: Card[] = [];
  const monsterCards5Cost: Card[] = [];
  const monsterCardsLess5Cost: Card[] = [];
  const otherCards: Card[] = [];
  let totalCost = 0;

  playerCards.forEach((card) => {
    totalCost += card.cost;

    if (isDivinityUnitType(card.unit_type)) {
      divinityCards.push(card);
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

  const remainingPoints = allowedPoints - totalCost;

  return {
    divinityCards,
    monsterCards5Cost,
    monsterCardsLess5Cost,
    otherCards,
    totalCost,
    remainingPoints,
  };
};

/**
 * Minimum cost among divinity cards in the draft pool
 */
const getMinDivinityCardCost = (availableCards: Card[]): number | null => {
  const divinityCards = availableCards.filter((card) =>
    isDivinityUnitType(card.unit_type)
  );

  if (divinityCards.length === 0) {
    return null;
  }

  return Math.min(...divinityCards.map((card) => card.cost));
};

/**
 * Checks if a player can pick a card
 */
export const canPickCard = (
  card: Card,
  playerCards: Card[],
  remainingPoints: number,
  availableCards: Card[],
): CardPickRestrictions => {
  const stats = getPlayerCardStats(playerCards, 0);

  if (card.cost > remainingPoints) {
    return {
      canPick: false,
      reason: 'notEnoughPoints',
    };
  }

  if (isDivinityUnitType(card.unit_type) && stats.divinityCards.length >= 1) {
    return {
      canPick: false,
      reason: 'divinityCardLimitReached',
    };
  }

  if (card.unit_type === CARD_TYPES.MONSTER && card.cost === 5) {
    if (stats.monsterCards5Cost.length >= 1) {
      return {
        canPick: false,
        reason: 'monster5CostLimitReached',
      };
    }
  }

  if (
    stats.divinityCards.length === 0 &&
    !isDivinityUnitType(card.unit_type)
  ) {
    const minDivinityCardCost = getMinDivinityCardCost(availableCards);

    if (minDivinityCardCost !== null) {
      const pointsAfterPick = remainingPoints - card.cost;
      if (pointsAfterPick < minDivinityCardCost) {
        return {
          canPick: false,
          reason: 'mustReservePointsForDivinity',
        };
      }
    }
  }

  return { canPick: true };
};

/**
 * Checks if a player can start the game
 */
export const canStartGame = (
  playerCards: Card[],
  remainingPoints: number,
): CardPickRestrictions => {
  const stats = getPlayerCardStats(playerCards, 0);

  if (stats.divinityCards.length === 0) {
    return {
      canPick: false,
      reason: 'mustPickDivinityCard',
    };
  }

  if (remainingPoints !== 0) {
    return {
      canPick: false,
      reason: 'mustUseAllPoints',
    };
  }

  return { canPick: true };
};

export { getPlayerCardStats };
