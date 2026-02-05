"use client";

import { useCallback, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Card, Draft, UserProfile } from "@/types/database.types";
import { api } from "@/trpc/client";
import { parseDraftHistory, sortPicksByNumber } from "@/utils/drafts";
import { formatDisplayName } from "@/utils/users";
import Loader from "@/components/Loader";
import {
  CardPreviewDialog,
  PickHistoryItem,
} from "@/app/components/DraftInfo/components";
import { PlayerSection } from "./PlayerSection";

type UserData = Pick<
  UserProfile,
  "id" | "email" | "display_name" | "avatar_url"
>;

interface DraftFinishedProps {
  draft: Draft;
  cards: Card[] | undefined;
}

export default function DraftFinished({ draft, cards }: DraftFinishedProps) {
  const { t } = useTranslation();
  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  const draftHistory = useMemo(
    () => parseDraftHistory(draft.draft_history),
    [draft.draft_history]
  );

  const sortedPicks = useMemo(() => {
    if (!draftHistory?.picks) {
      return [];
    }
    return sortPicksByNumber(draftHistory.picks);
  }, [draftHistory]);

  const { data: usersData, isLoading: usersLoading } =
    api.users.getUsersByIds.useQuery(
      { userIds: [draft.player1_id, draft.player2_id] },
      {
        enabled: !!draft,
      }
    );

  const cardsMap = useMemo(() => {
    const map: Record<string, Card> = {};
    cards?.forEach((card: Card) => {
      map[card.id] = card;
    });
    return map;
  }, [cards]);

  const usersMap = useMemo(() => {
    const map: Record<string, UserData> = {};
    usersData?.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [usersData]);

  const player1Cards: Card[] = [];
  const player2Cards: Card[] = [];
  let player1TotalCost = 0;
  let player2TotalCost = 0;

  sortedPicks.forEach((pick) => {
    const card = cardsMap[pick.card_id];
    if (!card) return;

    if (pick.player_id === draft.player1_id) {
      player1Cards.push(card);
      player1TotalCost += card.cost;
    } else if (pick.player_id === draft.player2_id) {
      player2Cards.push(card);
      player2TotalCost += card.cost;
    }
  });

  const player1Name = usersMap[draft.player1_id]
    ? formatDisplayName(
        usersMap[draft.player1_id].display_name,
        usersMap[draft.player1_id].email
      )
    : t("player1");

  const player2Name = usersMap[draft.player2_id]
    ? formatDisplayName(
        usersMap[draft.player2_id].display_name,
        usersMap[draft.player2_id].email
      )
    : t("player2");

  const loading = usersLoading || !cards;

  const handleSetPreviewCard = useCallback((card: Card | null) => {
    setPreviewCard(card);
  }, []);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-lg">
      <div className="relative flex flex-col gap-2 pe-32">
        <div className="flex items-center gap-3 text-purple-700">
          <ClipboardList className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">{t("draftHistoryDetails")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("draftHistoryDescription")}
        </p>
      </div>

      {loading ? (
        <div className="py-16">
          <Loader />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PlayerSection
              name={player1Name}
              cards={player1Cards}
              totalCost={player1TotalCost}
              accent="blue"
              onCardClick={(card) => handleSetPreviewCard(card)}
            />
            <PlayerSection
              name={player2Name}
              cards={player2Cards}
              totalCost={player2TotalCost}
              accent="green"
              onCardClick={(card) => handleSetPreviewCard(card)}
            />
          </div>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("draftHistory")}
              </h3>
              <span className="text-sm text-gray-500">
                {sortedPicks.length} {t("picks")}
              </span>
            </div>

            {sortedPicks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500">
                {t("draftHistoryEmpty")}
              </div>
            ) : (
              <div className="max-h-[500px] space-y-3 overflow-y-auto rounded-2xl border-2 border-gray-100 bg-gray-50/80 p-4">
                {sortedPicks.map((pick) => {
                  const isPlayer1 = pick.player_id === draft.player1_id;
                  const user = usersMap[pick.player_id];
                  const card = cardsMap[pick.card_id];

                  return (
                    <PickHistoryItem
                      key={`${pick.pick_number}-${pick.card_id}`}
                      pick={pick}
                      card={card}
                      user={user}
                      isPlayer1={isPlayer1}
                      onCardClick={() => handleSetPreviewCard(card ?? null)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <CardPreviewDialog
        card={previewCard}
        onClose={() => handleSetPreviewCard(null)}
      />
    </div>
  );
}
