"use client";

import { useTranslation } from "react-i18next";
import { PlayerSection } from "@/app/draft/[draftId]/components/DraftFinished/PlayerSection";
import { MapSection } from "@/app/draft/[draftId]/components/MapSection/MapSection";
import { cardsInListedOrder } from "@/utils/shared-drafts/cardsInListedOrder";
import { totalCardCost } from "@/utils/shared-drafts/totalCardCost";
import { EMPTY_COST_OVERRIDES } from "./constants";
import type { SharedDraftPreviewProps } from "./types";

export default function SharedDraftPreview({
  draft,
  onCardClick,
}: SharedDraftPreviewProps) {
  const { t } = useTranslation();
  const player1Cards = cardsInListedOrder(draft.player1_card_ids, draft.cards);
  const player2Cards = cardsInListedOrder(draft.player2_card_ids, draft.cards);

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
      <MapSection mapId={draft.map_id} mapSide={draft.map_side} />
    </section>
  );
}
