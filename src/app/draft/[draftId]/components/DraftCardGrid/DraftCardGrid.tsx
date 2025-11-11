"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import { DraftCardItem } from "../DraftCardItem";
import { DraftCardFilter } from "../DraftCardFilter";
import CardGalleryModal from "@/app/wiki/components/CardGalleryModal/CardGalleryModal";
import {
  getFilteredData,
  getUniqueCosts,
} from "@/app/wiki/components/CardGallery/utils";
import { useSelectedType, useSelectedCost } from "@/stores/cardFilters";
import type { Card } from "@/types/database.types";

interface DraftCardGridProps {
  cards: Card[];
  pickedCardIds: Set<string>;
  onPickCard: (cardId: string) => void;
  isLoading?: boolean;
  canPick?: boolean;
}

export function DraftCardGrid({
  cards,
  pickedCardIds,
  onPickCard,
  isLoading = false,
  canPick = true,
}: DraftCardGridProps) {
  const { t } = useTranslation();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const selectedType = useSelectedType();
  const selectedCost = useSelectedCost();

  const uniqueCosts = useMemo(() => getUniqueCosts(cards || []), [cards]);

  const filteredCards = useMemo(
    () => getFilteredData(cards || [], "", selectedType, selectedCost),
    [cards, selectedType, selectedCost]
  );

  const onCloseModalHandler = useCallback(() => {
    setSelectedCard(null);
  }, []);

  // Мемоизировать проверку, выбрана ли карта
  const isCardPicked = useCallback((cardId: string) => {
    return pickedCardIds.has(cardId);
  }, [pickedCardIds]);

  // Мемоизировать обработчик клика по карте (принимает card напрямую)
  const handleCardClick = useCallback((card: Card) => {
    setSelectedCard(card);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

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
            {filteredCards.map((card) => (
              <DraftCardItem
                key={card.id}
                card={card}
                onPick={onPickCard}
                onCardClick={handleCardClick}
                isPicked={isCardPicked(card.id)}
                canPick={canPick}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>

      {!!selectedCard && (
        <CardGalleryModal
          selected={selectedCard}
          onCloseAction={onCloseModalHandler}
        />
      )}
    </div>
  );
}
