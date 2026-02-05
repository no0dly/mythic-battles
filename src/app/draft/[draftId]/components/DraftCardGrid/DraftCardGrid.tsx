"use client";

import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DraftCardItem } from "../DraftCardItem";
import { DraftCardFilter } from "../DraftCardFilter";
import {
  getFilteredData,
  getUniqueCosts,
} from "@/app/wiki/components/CardGallery/utils";
import { useSelectedType, useSelectedCost } from "@/stores/cardFilters";
import type { Card, Draft, UserSubset } from "@/types/database.types";
import useGetPickedCardsIDs from "./hooks/useGetPickedCardsIDs";
import { api } from "@/trpc/client";
import { canPickCard } from "@/utils/drafts/cardPickRestrictions";
import { getPlayerCards } from "@/utils/drafts/helpers";
import { DEFAULT_DRAFT_SETTINGS, CARD_TYPES } from "@/types/constants";
import { createCardIdMap } from "@/utils/cards/createCardIdMap";

interface DraftCardGridProps {
  cards: Card[];
  draft: Draft;
  user: UserSubset;
}

export function DraftCardGrid({ cards, draft, user }: DraftCardGridProps) {
  const { t } = useTranslation();
  const selectedType = useSelectedType();
  const selectedCost = useSelectedCost();
  const pickedCardIds = useGetPickedCardsIDs(draft);

  // Get game settings to get allowed points
  const { data: gameSettings } = api.games.getGameSettings.useQuery(
    { game_id: draft.game_id },
    { enabled: !!draft.game_id }
  );

  const allowedPoints =
    gameSettings?.user_allowed_points ??
    DEFAULT_DRAFT_SETTINGS.user_allowed_points;

  const uniqueCosts = useMemo(() => getUniqueCosts(cards || []), [cards]);

  const filteredCards = useMemo(
    () => getFilteredData(cards || [], "", selectedType, selectedCost),
    [cards, selectedType, selectedCost]
  );

  const cardMap = useMemo(() => createCardIdMap(cards), [cards]);

  const isCurrentUserTurn = useMemo(() => {
    return draft.current_turn_user_id === user.id;
  }, [draft, user]);

  // Get player's currently picked cards
  const playerCards = useMemo(
    () => getPlayerCards(draft, cardMap, user.id),
    [draft, cardMap, user.id]
  );

  const isCardPicked = useCallback(
    (cardId: string, cardType?: string) => {
      // Art of war cards can be picked multiple times, so never mark them as "picked"
      if (cardType === CARD_TYPES.ART_OF_WAR) {
        return false;
      }
      return pickedCardIds.has(cardId);
    },
    [pickedCardIds]
  );

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("noCardsAvailable")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 z-10 bg-background pb-2">
        <DraftCardFilter uniqueCosts={uniqueCosts} />

        {filteredCards && (
          <p className="text-sm text-muted-foreground py-2">
            {t("showingCards", {
              count: filteredCards.length,
              total: cards.length,
            })}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCards.length === 0 ? (
          <div className="flex items-center justify-center h-full py-8">
            <p className="text-muted-foreground">
              {t("noCardsFoundMatchingYourFilters")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCards.map((card) => {
              const isPicked = isCardPicked(card.id, card.unit_type);

              // Check card pick restrictions
              const restrictions = canPickCard(
                card,
                playerCards,
                allowedPoints,
                cards // Available cards from draft pool
              );

              return (
                <DraftCardItem
                  key={card.id}
                  card={card}
                  isPicked={isPicked}
                  isCurrentUserTurn={isCurrentUserTurn}
                  canPickCard={restrictions.canPick}
                  restrictionReason={restrictions.reason}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
