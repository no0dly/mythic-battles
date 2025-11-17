import { useMemo } from 'react';
import type { Card, Draft } from '@/types/database.types';
import { canPickCard } from '@/utils/drafts/cardPickRestrictions';
import { getPlayerCards } from '@/utils/drafts/helpers';

interface UseCardPickRestrictionsParams {
  card: Card;
  draft: Draft;
  allCards: Card[] | undefined;
  currentPlayerId: string;
  allowedPoints: number;
  availableCards: Card[];
}

/**
 * Hook to check if the current player can pick a card
 * @param params - parameters for checking card pick restrictions
 * @returns restrictions object with canPick boolean and optional reason
 */
export const useCardPickRestrictions = ({
  card,
  draft,
  allCards,
  currentPlayerId,
  allowedPoints,
  availableCards,
}: UseCardPickRestrictionsParams) => {
  const playerCards = useMemo(
    () => getPlayerCards(draft, allCards, currentPlayerId),
    [draft, allCards, currentPlayerId]
  );

  const restrictions = useMemo(
    () => canPickCard(card, playerCards, allowedPoints, availableCards),
    [card, playerCards, allowedPoints, availableCards]
  );

  return restrictions;
};

