"use client";

import { useState } from "react";
import { ClipboardList, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Card } from "@/types/database.types";
import type { DraftWithRelations } from "@/utils/drafts/interfaces";
import { api } from "@/trpc/client";
import { parseDraftHistory, sortPicksByNumber } from "@/utils/drafts";
import { getDraftPlayerIds } from "@/utils/drafts/turnOrder";
import { getDraftSeats } from "@/utils/drafts/seats";
import { useMultiplayerDraftSeats, type DraftSeatInfo } from "@/hooks";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  CardPreviewDialog,
  PickHistoryItem,
} from "@/app/components/DraftInfo/components";
import { MultiplayerDraftHistoryModal } from "@/app/components/DraftInfo/MultiplayerDraftHistoryModal";
import { PlayerSection } from "../DraftFinished/PlayerSection";
import { MapSection } from "../MapSection/MapSection";
import DraftShareControl from "../DraftShareControl";

interface MultiplayerDraftFinishedProps {
  draft: DraftWithRelations;
  cards: Card[] | undefined;
}

const sortSeatsByTeam = (seats: DraftSeatInfo[]) =>
  [...seats].sort((a, b) => (a.team ?? 0) - (b.team ?? 0));

export function MultiplayerDraftFinished({ draft, cards }: MultiplayerDraftFinishedProps) {
  const { t } = useTranslation();
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const playerIds = getDraftPlayerIds(draft);

  const { data: usersData, isLoading: usersLoading } = api.users.getUsersByIds.useQuery(
    { userIds: playerIds },
    { enabled: playerIds.length > 0 }
  );

  const { seats, picks } = useMultiplayerDraftSeats({
    draft,
    cards,
    players: usersData,
    userAllowedPoints: undefined,
  });

  const sortedPicks = sortPicksByNumber(picks);
  const costOverrides = new Map(
    picks
      .filter((pick) => pick.cost_override !== undefined)
      .map((pick) => [pick.card_id, pick.cost_override!])
  );
  const seatByUserId = new Map(seats.map((seat) => [seat.userId, seat]));
  const usersMap = new Map((usersData ?? []).map((user) => [user.id, user]));
  const namedSeats = getDraftSeats(draft).map((seat) => ({
    ...seat,
    name: seatByUserId.get(seat.userId)?.name ?? seat.seatLabel,
  }));
  const loading = usersLoading || !cards;

  return (
    <div
      className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-lg"
      data-testid="multiplayer-draft-finished"
    >
      <div className="relative flex flex-col gap-2 pe-32">
        <div className="flex items-center gap-3 text-purple-700">
          <ClipboardList className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">{t("draftHistoryDetails")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t("draftHistoryDescription")}</p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryOpen(true)}
            data-testid="draft-finished-view-history"
          >
            <History />
            {t("viewDetailedHistory")}
          </Button>
          <DraftShareControl draftId={draft.id} finishedAt={draft.updated_at} />
        </div>
      </div>

      {loading ? (
        <div className="py-16">
          <Loader />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {sortSeatsByTeam(seats).map((seat) => (
              <PlayerSection
                key={seat.userId}
                name={seat.name}
                cards={seat.cards}
                totalCost={seat.spent}
                costOverrides={costOverrides}
                accent={seat.accent}
                subtitle={
                  seat.team !== null
                    ? `${seat.seatLabel} · ${t("draftTeamLabel", { number: seat.team })}`
                    : seat.seatLabel
                }
                onCardClick={setPreviewCard}
              />
            ))}
          </div>

          <MapSection mapId={draft.map_id} mapSide={draft.map_side} />

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{t("draftHistory")}</h3>
              <span className="text-sm text-gray-500">
                {sortedPicks.length} {t("picks")}
              </span>
            </div>

            {sortedPicks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500">
                {t("draftHistoryEmpty")}
              </div>
            ) : (
              <div className="max-h-[500px] space-y-3 overflow-y-auto rounded-2xl border-2 border-gray-100 bg-gray-50/80 p-4 touch-scroll-y">
                {sortedPicks.map((pick) => {
                  const card = cards?.find((item) => item.id === pick.card_id);
                  return (
                    <PickHistoryItem
                      key={`${pick.pick_number}-${pick.card_id}`}
                      pick={pick}
                      card={card}
                      user={usersMap.get(pick.player_id)}
                      isPlayer1={pick.player_id === draft.player1_id}
                      accent={seatByUserId.get(pick.player_id)?.accent}
                      onCardClick={() => setPreviewCard(card ?? null)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <CardPreviewDialog card={previewCard} onClose={() => setPreviewCard(null)} />

      <MultiplayerDraftHistoryModal
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        draftHistory={parseDraftHistory(draft.draft_history)}
        seats={namedSeats}
        mapId={draft.map_id}
        mapSide={draft.map_side}
      />
    </div>
  );
}
