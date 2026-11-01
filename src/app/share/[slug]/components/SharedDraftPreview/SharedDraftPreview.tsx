"use client";

import { useTranslation } from "react-i18next";
import { PlayerSection } from "@/app/draft/[draftId]/components/DraftFinished/PlayerSection";
import { MapSection } from "@/app/draft/[draftId]/components/MapSection/MapSection";
import { cardsInListedOrder } from "@/utils/shared-drafts/cardsInListedOrder";
import { totalCardCost } from "@/utils/shared-drafts/totalCardCost";
import { getPlayerAccent } from "@/utils/drafts/playerAccents";
import { SEAT_LABELS } from "@/utils/drafts/turnOrder";
import { EMPTY_COST_OVERRIDES } from "./constants";
import type { SharedDraftPreviewProps } from "./types";

const ONE_VS_ONE_ARMY_COUNT = 2;
const ONE_VS_ONE_NAME_KEYS = ["player1", "player2"];

export default function SharedDraftPreview({
  draft,
  onCardClick,
}: SharedDraftPreviewProps) {
  const { t } = useTranslation();
  const isOneVsOne = draft.armies.length <= ONE_VS_ONE_ARMY_COUNT;

  return (
    <section
      className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-lg"
      data-testid="shared-draft-preview"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {draft.armies.map((army, index) => {
          const cards = cardsInListedOrder(army.card_ids, draft.cards);
          const team = army.team ?? null;
          return (
            <PlayerSection
              key={SEAT_LABELS[index]}
              name={
                isOneVsOne
                  ? t(ONE_VS_ONE_NAME_KEYS[index])
                  : t("sharedDraftSeatName", { seat: SEAT_LABELS[index] })
              }
              subtitle={team !== null ? t("draftTeamLabel", { number: team }) : undefined}
              cards={cards}
              totalCost={totalCardCost(cards)}
              costOverrides={EMPTY_COST_OVERRIDES}
              accent={getPlayerAccent(index, team)}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>
      <MapSection mapId={draft.map_id} mapSide={draft.map_side} />
    </section>
  );
}
