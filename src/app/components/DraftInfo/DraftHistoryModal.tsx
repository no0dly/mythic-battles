"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DraftHistory, Card, UserProfile } from "@/types/database.types";
import { api } from "@/trpc/client";
import { sortPicksByNumber } from "@/utils/drafts";
import { formatDisplayName } from "@/utils/users";
import Loader from "@/components/Loader";
import { ClipboardList } from "lucide-react";
import {
  PickHistoryItem,
  PlayerCardsTab,
  CardPreviewDialog,
} from "./components";

interface DraftHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftHistory: DraftHistory | null;
  player1Id: string;
  player2Id: string;
  draftTotalCost: number;
}

type UserData = Pick<
  UserProfile,
  "id" | "email" | "display_name" | "avatar_url"
>;

export const DraftHistoryModal = ({
  open,
  onOpenChange,
  draftHistory,
  player1Id,
  player2Id,
}: DraftHistoryModalProps) => {
  const { t } = useTranslation();
  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  const uniqueCardIds = draftHistory?.picks
    ? [...new Set(draftHistory.picks.map((pick) => pick.card_id))]
    : [];

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

  const users: Record<string, UserData> = {};
  usersData?.forEach((user) => {
    users[user.id] = user;
  });

  const cards: Record<string, Card> = {};
  cardsData?.forEach((card) => {
    cards[card.id] = card;
  });

  const loading = usersLoading || cardsLoading;

  const handleSetPreviewCard = useCallback((card: Card | null) => {
    setPreviewCard(card);
  }, []);

  if (!draftHistory?.picks) {
    return null;
  }

  const sortedPicks = sortPicksByNumber(draftHistory.picks);

  const player1Cards: Card[] = [];
  const player2Cards: Card[] = [];
  let player1TotalCost = 0;
  let player2TotalCost = 0;

  sortedPicks.forEach((pick) => {
    const card = cards[pick.card_id];
    if (card) {
      if (pick.player_id === player1Id) {
        player1Cards.push(card);
        player1TotalCost += card.cost;
      } else {
        player2Cards.push(card);
        player2TotalCost += card.cost;
      }
    }
  });

  const player1 = users[player1Id];
  const player2 = users[player2Id];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-purple-600" />
              {t("draftHistoryDetails")}
            </DialogTitle>
            <DialogDescription>
              {t("draftHistoryDescription")}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : (
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history">{t("draftHistory")}</TabsTrigger>
                <TabsTrigger value="player1">
                  {player1
                    ? formatDisplayName(player1.display_name, player1.email)
                    : t("player1")}
                </TabsTrigger>
                <TabsTrigger value="player2">
                  {player2
                    ? formatDisplayName(player2.display_name, player2.email)
                    : t("player2")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-3">
                <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
                  {sortedPicks.map((pick) => {
                    const isPlayer1 = pick.player_id === player1Id;
                    const user = isPlayer1 ? player1 : player2;
                    const card = cards[pick.card_id];

                    return (
                      <PickHistoryItem
                        key={`${pick.pick_number}-${pick.card_id}`}
                        pick={pick}
                        card={card}
                        user={user}
                        isPlayer1={isPlayer1}
                        onCardClick={() => handleSetPreviewCard(card || null)}
                      />
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="player1" className="space-y-4">
                <PlayerCardsTab
                  user={player1}
                  playerCards={player1Cards}
                  totalCost={player1TotalCost}
                  fallbackName={t("player1")}
                  borderColor="blue"
                  onCardClick={(card) => handleSetPreviewCard(card)}
                />
              </TabsContent>

              <TabsContent value="player2" className="space-y-4">
                <PlayerCardsTab
                  user={player2}
                  playerCards={player2Cards}
                  totalCost={player2TotalCost}
                  fallbackName={t("player2")}
                  borderColor="green"
                  onCardClick={(card) => handleSetPreviewCard(card)}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <CardPreviewDialog
        card={previewCard}
        onClose={() => handleSetPreviewCard(null)}
      />
    </>
  );
};
