"use client";

import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DraftPoolTab,
  PickHistoryItem,
} from "@/app/components/DraftInfo/components";
import type { DraftPoolRailPick } from "@/app/components/DraftInfo/components/DraftPoolTab";
import type { Card } from "@/types/database.types";
import { cn } from "@/lib/utils";
import { groupPicksByCardId, sortPicksByNumber } from "@/utils/drafts";
import { getPlayerAccent } from "@/utils/drafts/playerAccents";
import { SEAT_LABELS } from "@/utils/drafts/turnOrder";
import { ONE_VS_ONE_ARMY_COUNT } from "../../constants";
import { HISTORY_TAB, POOL_TAB, SEAT_A, SEAT_B } from "./constants";
import type { SharedDraftHistoryProps } from "./types";

export default function SharedDraftHistory({
  draft,
  onCardClick,
}: SharedDraftHistoryProps) {
  const { t } = useTranslation();

  if (draft.picks.length === 0) {
    return null;
  }

  const cardsById = new Map(draft.cards.map((card) => [card.id, card]));
  const sortedPicks = sortPicksByNumber(draft.picks);
  const isOneVsOne = draft.armies.length <= ONE_VS_ONE_ARMY_COUNT;
  const showPool = isOneVsOne && draft.draft_pool.length > 0;

  const seatName = (seat: string) =>
    isOneVsOne
      ? t(seat === SEAT_A ? "player1" : "player2")
      : t("sharedDraftSeatName", { seat });

  const seatAccent = (seat: string) => {
    const index = SEAT_LABELS.findIndex((label) => label === seat);
    return getPlayerAccent(index, draft.armies[index]?.team ?? null);
  };

  const railPicksFor = (seat: string): DraftPoolRailPick[] =>
    sortedPicks
      .filter((pick) => pick.player_id === seat)
      .map((pick) => ({ pick, card: cardsById.get(pick.card_id) }));

  const totalCostFor = (railPicks: DraftPoolRailPick[]) =>
    railPicks.reduce(
      (sum, { pick, card }) => sum + (pick.cost_override ?? card?.cost ?? 0),
      0,
    );

  const player1Picks = railPicksFor(SEAT_A);
  const player2Picks = railPicksFor(SEAT_B);
  const poolCards = [
    ...new Set([...draft.draft_pool, ...sortedPicks.map((pick) => pick.card_id)]),
  ]
    .map((id) => cardsById.get(id))
    .filter((card): card is Card => !!card);

  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-lg"
      data-testid="shared-draft-history"
    >
      <Tabs defaultValue={HISTORY_TAB} className="flex flex-col">
        <TabsList
          className={cn("grid h-auto w-full", showPool ? "grid-cols-2" : "grid-cols-1")}
        >
          <TabsTrigger value={HISTORY_TAB}>{t("draftHistory")}</TabsTrigger>
          {showPool && (
            <TabsTrigger value={POOL_TAB}>{t("draftWithPool")}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={HISTORY_TAB}>
          <div className="max-h-[500px] space-y-2 overflow-y-auto rounded-lg border-2 border-gray-200 bg-gray-50 p-3 touch-scroll-y">
            {sortedPicks.map((pick) => {
              const card = cardsById.get(pick.card_id);
              return (
                <PickHistoryItem
                  key={`${pick.pick_number}-${pick.card_id}`}
                  pick={pick}
                  card={card}
                  user={undefined}
                  isPlayer1={pick.player_id === SEAT_A}
                  accent={seatAccent(pick.player_id)}
                  fallbackName={seatName(pick.player_id)}
                  onCardClick={() => card && onCardClick(card)}
                />
              );
            })}
          </div>
        </TabsContent>

        {showPool && (
          <TabsContent value={POOL_TAB} className="lg:h-[70vh] lg:overflow-hidden">
            <DraftPoolTab
              poolCards={poolCards}
              picksByCardId={groupPicksByCardId(sortedPicks)}
              player1Picks={player1Picks}
              player2Picks={player2Picks}
              player1TotalCost={totalCostFor(player1Picks)}
              player2TotalCost={totalCostFor(player2Picks)}
              player1Id={SEAT_A}
              player1={undefined}
              player2={undefined}
            />
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
}
