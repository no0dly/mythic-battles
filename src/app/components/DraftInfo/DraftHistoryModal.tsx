"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DraftHistory, Card, MapSide } from "@/types/database.types";
import { MapSection } from "@/app/draft/[draftId]/components/MapSection/MapSection";
import { api } from "@/trpc/client";
import { groupPicksByCardId, sortPicksByNumber } from "@/utils/drafts";
import { formatDisplayName } from "@/utils/users";
import Loader from "@/components/Loader";
import { ClipboardList } from "lucide-react";
import {
  PickHistoryItem,
  PlayerCardsTab,
  CardPreviewDialog,
  DraftPoolTab,
} from "./components";
import type { DraftPoolRailPick } from "./components/DraftPoolTab";

interface DraftHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftHistory: DraftHistory | null;
  player1Id: string;
  player2Id: string;
  draftPool?: string[];
  mapId?: string | null;
  mapSide?: MapSide | null;
}

const TAB_SCROLL_CLASS =
  "lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:touch-scroll-y";

export const DraftHistoryModal = ({
  open,
  onOpenChange,
  draftHistory,
  player1Id,
  player2Id,
  draftPool = [],
  mapId,
  mapSide,
}: DraftHistoryModalProps) => {
  const { t } = useTranslation();
  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  const uniqueCardIds = useMemo(() => {
    const pickedIds = draftHistory?.picks?.map((pick) => pick.card_id) ?? [];
    return [...new Set([...draftPool, ...pickedIds])];
  }, [draftPool, draftHistory]);

  const { data: usersData, isLoading: usersLoading } =
    api.users.getUsersByIds.useQuery(
      { userIds: [player1Id, player2Id] },
      { enabled: open && !!draftHistory?.picks }
    );

  const { data: cardsData, isLoading: cardsLoading } =
    api.cards.getByIds.useQuery(
      { ids: uniqueCardIds },
      { enabled: open && uniqueCardIds.length > 0 }
    );

  const users = useMemo(() => {
    const map: Record<string, NonNullable<typeof usersData>[number]> = {};
    usersData?.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [usersData]);

  const cards = useMemo(() => {
    const map: Record<string, Card> = {};
    cardsData?.forEach((card) => {
      map[card.id] = card;
    });
    return map;
  }, [cardsData]);

  const loading = usersLoading || cardsLoading;

  if (!draftHistory?.picks) {
    return null;
  }

  const sortedPicks = sortPicksByNumber(draftHistory.picks);
  const picksByCardId = groupPicksByCardId(sortedPicks);

  const player1Cards: Card[] = [];
  const player2Cards: Card[] = [];
  const player1Picks: DraftPoolRailPick[] = [];
  const player2Picks: DraftPoolRailPick[] = [];
  let player1TotalCost = 0;
  let player2TotalCost = 0;
  const costOverrides = new Map<string, number>();

  sortedPicks.forEach((pick) => {
    const card = cards[pick.card_id];
    const railPick = { pick, card };

    if (pick.player_id === player1Id) {
      player1Picks.push(railPick);
    } else if (pick.player_id === player2Id) {
      player2Picks.push(railPick);
    }

    if (!card) {
      return;
    }

    const effectiveCost = pick.cost_override ?? card.cost;
    if (pick.cost_override !== undefined) {
      costOverrides.set(pick.card_id, pick.cost_override);
    }

    if (pick.player_id === player1Id) {
      player1Cards.push(card);
      player1TotalCost += effectiveCost;
    } else {
      player2Cards.push(card);
      player2TotalCost += effectiveCost;
    }
  });

  const poolCards = uniqueCardIds
    .map((id) => cards[id])
    .filter((card): card is Card => !!card);

  const player1 = users[player1Id];
  const player2 = users[player2Id];
  const player1Name = player1
    ? formatDisplayName(player1.display_name, player1.email)
    : t("player1");
  const player2Name = player2
    ? formatDisplayName(player2.display_name, player2.email)
    : t("player2");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-auto max-h-[calc(100svh-1rem)] min-h-0 w-full max-w-7xl! flex-col overflow-y-auto overscroll-y-contain touch-scroll-y lg:h-[min(90dvh,calc(100svh-1rem))] lg:overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-purple-600" />
              {t("draftHistoryDetails")}
            </DialogTitle>
            <DialogDescription>
              {t("draftHistoryDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="shrink-0">
            <MapSection mapId={mapId} mapSide={mapSide} />
          </div>

          {loading ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : (
            <Tabs
              defaultValue="history"
              className="flex flex-col lg:min-h-0 lg:flex-1"
            >
              <TabsList className="grid h-auto w-full shrink-0 grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="history">{t("draftHistory")}</TabsTrigger>
                <TabsTrigger value="player1" className="truncate">
                  {player1Name}
                </TabsTrigger>
                <TabsTrigger value="player2" className="truncate">
                  {player2Name}
                </TabsTrigger>
                <TabsTrigger value="pool">{t("draftWithPool")}</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className={TAB_SCROLL_CLASS}>
                <div className="space-y-2 rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
                  {sortedPicks.map((pick) => {
                    const isPlayer1 = pick.player_id === player1Id;
                    const card = cards[pick.card_id];

                    return (
                      <PickHistoryItem
                        key={`${pick.pick_number}-${pick.card_id}`}
                        pick={pick}
                        card={card}
                        user={isPlayer1 ? player1 : player2}
                        isPlayer1={isPlayer1}
                        onCardClick={() => setPreviewCard(card ?? null)}
                      />
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="player1" className={TAB_SCROLL_CLASS}>
                <PlayerCardsTab
                  user={player1}
                  playerCards={player1Cards}
                  totalCost={player1TotalCost}
                  costOverrides={costOverrides}
                  fallbackName={t("player1")}
                  borderColor="blue"
                  onCardClick={setPreviewCard}
                />
              </TabsContent>

              <TabsContent value="player2" className={TAB_SCROLL_CLASS}>
                <PlayerCardsTab
                  user={player2}
                  playerCards={player2Cards}
                  totalCost={player2TotalCost}
                  costOverrides={costOverrides}
                  fallbackName={t("player2")}
                  borderColor="green"
                  onCardClick={setPreviewCard}
                />
              </TabsContent>

              <TabsContent
                value="pool"
                className="lg:min-h-0 lg:flex-1 lg:overflow-hidden"
              >
                <DraftPoolTab
                  poolCards={poolCards}
                  picksByCardId={picksByCardId}
                  player1Picks={player1Picks}
                  player2Picks={player2Picks}
                  player1TotalCost={player1TotalCost}
                  player2TotalCost={player2TotalCost}
                  player1Id={player1Id}
                  player1={player1}
                  player2={player2}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <CardPreviewDialog
        card={previewCard}
        onClose={() => setPreviewCard(null)}
      />
    </>
  );
};
