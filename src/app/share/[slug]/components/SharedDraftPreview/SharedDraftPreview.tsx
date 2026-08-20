"use client";

import { useTranslation } from "react-i18next";
import type { Card, SharedDraftArmy } from "@/types/database.types";
import { PlayerSection } from "@/app/draft/[draftId]/components/DraftFinished/PlayerSection";
import { cardsInListedOrder } from "@/utils/shared-drafts/cardsInListedOrder";
import { totalCardCost } from "@/utils/shared-drafts/totalCardCost";
import { EMPTY_COST_OVERRIDES } from "./constants";

interface SharedDraftPreviewProps {
  army: SharedDraftArmy;
  cards: Card[];
  onCardClick: (card: Card) => void;
}

export default function SharedDraftPreview({
  army,
  cards,
  onCardClick,
}: SharedDraftPreviewProps) {
  const { t } = useTranslation();
  const player1Cards = cardsInListedOrder(army.player1_card_ids, cards);
  const player2Cards = cardsInListedOrder(army.player2_card_ids, cards);

  return (
    <section
      className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-lg"
      data-testid="shared-draft-preview"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlayerSection
          name={t("player1")}
          cards={player1Cards}
          totalCost={totalCardCost(player1Cards)}
          costOverrides={EMPTY_COST_OVERRIDES}
          accent="blue"
          onCardClick={onCardClick}
        />
        <PlayerSection
          name={t("player2")}
          cards={player2Cards}
          totalCost={totalCardCost(player2Cards)}
          costOverrides={EMPTY_COST_OVERRIDES}
          accent="green"
          onCardClick={onCardClick}
        />
      </div>
    </section>
  );
}
