"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Card, DraftHistory, MapSide } from "@/types/database.types";
import { MapSection } from "@/app/draft/[draftId]/components/MapSection/MapSection";
import { api } from "@/trpc/client";
import { sortPicksByNumber } from "@/utils/drafts";
import Loader from "@/components/Loader";
import {
  CardPreviewDialog,
  PickHistoryItem,
  PlayerCardsTab,
  type NamedDraftSeat,
} from "./components";

const HISTORY_TAB = "history";
const TAB_SCROLL_CLASS = "lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:touch-scroll-y";

interface MultiplayerDraftHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftHistory: DraftHistory | null;
  seats: NamedDraftSeat[];
  mapId?: string | null;
  mapSide?: MapSide | null;
}

export const MultiplayerDraftHistoryModal = ({
  open,
  onOpenChange,
  draftHistory,
  seats,
  mapId,
  mapSide,
}: MultiplayerDraftHistoryModalProps) => {
  const { t } = useTranslation();
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const pickedIds = [...new Set(draftHistory?.picks?.map((pick) => pick.card_id) ?? [])];
  const userIds = seats.map((seat) => seat.userId);

  const { data: usersData, isLoading: usersLoading } = api.users.getUsersByIds.useQuery(
    { userIds },
    { enabled: open && userIds.length > 0 }
  );
  const { data: cardsData, isLoading: cardsLoading } = api.cards.getByIds.useQuery(
    { ids: pickedIds },
    { enabled: open && pickedIds.length > 0 }
  );

  if (!draftHistory?.picks) {
    return null;
  }

  const users = new Map((usersData ?? []).map((user) => [user.id, user]));
  const cards = new Map((cardsData ?? []).map((card) => [card.id, card]));
  const seatByUserId = new Map(seats.map((seat) => [seat.userId, seat]));
  const sortedPicks = sortPicksByNumber(draftHistory.picks);
  const costOverrides = new Map(
    sortedPicks
      .filter((pick) => pick.cost_override !== undefined)
      .map((pick) => [pick.card_id, pick.cost_override!])
  );

  const seatArmies = seats.map((seat) => {
    const seatPicks = sortedPicks.filter((pick) => pick.player_id === seat.userId);
    const seatCards = seatPicks
      .map((pick) => cards.get(pick.card_id))
      .filter((card): card is Card => !!card);
    const totalCost = seatPicks.reduce(
      (sum, pick) => sum + (pick.cost_override ?? cards.get(pick.card_id)?.cost ?? 0),
      0
    );
    return { seat, cards: seatCards, totalCost };
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-auto max-h-[calc(100svh-1rem)] min-h-0 w-full max-w-7xl! flex-col overflow-y-auto overscroll-y-contain touch-scroll-y lg:h-[min(90dvh,calc(100svh-1rem))] lg:overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-purple-600" />
              {t("draftHistoryDetails")}
            </DialogTitle>
            <DialogDescription>{t("draftHistoryDescription")}</DialogDescription>
          </DialogHeader>

          <div className="shrink-0">
            <MapSection mapId={mapId} mapSide={mapSide} />
          </div>

          {usersLoading || cardsLoading ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : (
            <Tabs defaultValue={HISTORY_TAB} className="flex flex-col lg:min-h-0 lg:flex-1">
              <TabsList className="grid h-auto w-full shrink-0 grid-cols-2 md:grid-cols-5">
                <TabsTrigger value={HISTORY_TAB}>{t("draftHistory")}</TabsTrigger>
                {seats.map((seat) => (
                  <TabsTrigger key={seat.userId} value={seat.userId} className="truncate">
                    {seat.seatLabel} · {seat.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={HISTORY_TAB} className={TAB_SCROLL_CLASS}>
                <div className="space-y-2 rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
                  {sortedPicks.map((pick) => {
                    const card = cards.get(pick.card_id);
                    return (
                      <PickHistoryItem
                        key={`${pick.pick_number}-${pick.card_id}`}
                        pick={pick}
                        card={card}
                        user={users.get(pick.player_id)}
                        isPlayer1={pick.player_id === seats[0]?.userId}
                        accent={seatByUserId.get(pick.player_id)?.accent}
                        onCardClick={() => setPreviewCard(card ?? null)}
                      />
                    );
                  })}
                </div>
              </TabsContent>

              {seatArmies.map(({ seat, cards: seatCards, totalCost }) => (
                <TabsContent key={seat.userId} value={seat.userId} className={TAB_SCROLL_CLASS}>
                  <PlayerCardsTab
                    user={users.get(seat.userId)}
                    playerCards={seatCards}
                    totalCost={totalCost}
                    costOverrides={costOverrides}
                    fallbackName={seat.name}
                    borderColor={seat.accent}
                    onCardClick={setPreviewCard}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <CardPreviewDialog card={previewCard} onClose={() => setPreviewCard(null)} />
    </>
  );
};
