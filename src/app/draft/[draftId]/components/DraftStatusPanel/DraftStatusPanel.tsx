"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Card as CardType } from "@/types/database.types";
import type { DraftWithRelations } from "@/utils/drafts/interfaces";
import { useDraftDetails } from "@/hooks";
import { DraftActionButtons, DraftStatusPanelSkeleton } from "./components";
import { MapSection } from "../MapSection/MapSection";
import { api } from "@/trpc/client";
import { canStartGame } from "@/utils/drafts";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DraftStatusPanelProps {
  draft: DraftWithRelations;
  cards: CardType[] | undefined;
}

export function DraftStatusPanel({ draft, cards }: DraftStatusPanelProps) {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const {
    game_id: gameId,
    player1_id: player1Id,
    player2_id: player2Id,
    resetRequest,
    readyCheck,
  } = draft;

  const playerIds = [player1Id, player2Id];

  const { data: players, isLoading: playersLoading } =
    api.users.getUsersByIds.useQuery(
      {
        userIds: playerIds,
      },
      {
        enabled: playerIds.length === 2,
      }
    );

  const { data: userAllowedPoints, isLoading: gameLoading } =
    api.games.getGameSettings.useQuery(
      {
        game_id: gameId,
      },
      {
        enabled: !!gameId,
        select: (data) => data?.user_allowed_points,
      }
    );

  const isLoading = playersLoading || gameLoading;

  const {
    player1Cards,
    player2Cards,
    player1Name,
    player2Name,
    firstUserRoll,
    secondUserRoll,
    player1Remaining,
    player2Remaining,
    isPlayer1Turn,
    isPlayer2Turn,
    draftRound,
    player1Status,
    player2Status,
    picks,
  } = useDraftDetails({
    draft,
    cards,
    players,
    userAllowedPoints,
  });

  // Check if current user can start the game
  const currentUserCards = useMemo(() => {
    if (!user) return [];
    return user.id === player1Id ? player1Cards : player2Cards;
  }, [user, player1Id, player1Cards, player2Cards]);

  const currentUserRemaining = user?.id === player1Id ? player1Remaining : player2Remaining;

  const { canPick, reason } = useMemo(() => {
    if (!user || !userAllowedPoints) return { canPick: true };
    return canStartGame(currentUserCards, currentUserRemaining);
  }, [currentUserCards, currentUserRemaining, user, userAllowedPoints]);

  const isPlayer1Ready =
    readyCheck?.first_player_id === player1Id || readyCheck?.second_player_id === player1Id;
  const isPlayer2Ready =
    readyCheck?.first_player_id === player2Id || readyCheck?.second_player_id === player2Id;

  const player1DisplayStatus = isPlayer1Ready ? t("readyConfirmed") : player1Status;
  const player2DisplayStatus = isPlayer2Ready ? t("readyConfirmed") : player2Status;

  // Map card_id → overridden cost for picks that have cost_override
  const costOverrideMap = useMemo(
    () =>
      new Map(
        picks
          .filter((p) => p.cost_override !== undefined)
          .map((p) => [p.card_id, p.cost_override!])
      ),
    [picks]
  );

  const player1StrategicValue = player1Cards.reduce(
    (sum, card) => sum + card.strategic_value,
    0
  );
  const player2StrategicValue = player2Cards.reduce(
    (sum, card) => sum + card.strategic_value,
    0
  );

  if (isLoading) {
    return <DraftStatusPanelSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1 mb-3 pb-4">
        <p>
          {t("initialRoll")} {firstUserRoll}-{secondUserRoll}
        </p>
        <p>
          {t("draftRound")} {draftRound}
        </p>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-sm">
            {player1Name} {player1DisplayStatus}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("availablePoints")} ({player1Remaining})
          </p>
        </div>
        <div
          className={`border-2 rounded-lg p-2 h-[20vh] flex flex-col ${
            isPlayer1Turn && player1Remaining > 0 ? "border-green-500" : "border-gray-300"
          } ${isPlayer1Ready ? "bg-green-500/10" : ""}`}
        >
          <p className="text-xs font-semibold mb-1 flex-shrink-0">
            {t("pickedCards")}
          </p>
          <div className="flex-1 overflow-y-auto space-y-1">
            {player1Cards.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("noCardsPicked")}
              </p>
            ) : (
              player1Cards.map((card, index) => (
                <p key={card.id} className="text-xs">
                  {index + 1} {card.unit_name} -{" "}
                  {t(`cardType.${card.unit_type}`)}, {costOverrideMap.get(card.id) ?? card.cost}
                </p>
              ))
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("strategicValue")}:{" "}
          {player1StrategicValue}
        </p>
      </div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-sm">
            {player2Name} {player2DisplayStatus}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("availablePoints")} ({player2Remaining})
          </p>
        </div>
        <div
          className={`border-2 rounded-lg p-2 h-[20vh] flex flex-col ${
            isPlayer2Turn && player2Remaining > 0 ? "border-green-500" : "border-gray-300"
          } ${isPlayer2Ready ? "bg-green-500/10" : ""}`}
        >
          <p className="text-xs font-semibold mb-1 flex-shrink-0">
            {t("pickedCards")}
          </p>
          <div className="flex-1 overflow-y-auto space-y-1">
            {player2Cards.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("noCardsPicked")}
              </p>
            ) : (
              player2Cards.map((card, index) => (
                <p key={card.id} className="text-xs">
                  {index + 1} {card.unit_name} -{" "}
                  {t(`cardType.${card.unit_type}`)}, {costOverrideMap.get(card.id) ?? card.cost}
                </p>
              ))
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("strategicValue")}:{" "}
          {player2StrategicValue}
        </p>
      </div>

      <MapSection mapId={draft.map_id} />

      <DraftActionButtons
        draftId={draft.id}
        draftStatus={draft.draft_status}
        canStartGame={canPick}
        startGameRestrictionReason={reason}
        resetRequest={resetRequest}
        readyCheck={readyCheck}
      />
    </div>
  );
}
