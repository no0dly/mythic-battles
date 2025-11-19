"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Draft, Card as CardType } from "@/types/database.types";
import { useDraftDetails } from "@/hooks";
import { DraftActionButtons, DraftStatusPanelSkeleton } from "./components";
import { api } from "@/trpc/client";
import { canStartGame } from "@/utils/drafts";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DraftStatusPanelProps {
  draft: Draft;
  cards: CardType[] | undefined;
}

export function DraftStatusPanel({ draft, cards }: DraftStatusPanelProps) {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const {
    game_id: gameId,
    player1_id: player1Id,
    player2_id: player2Id,
  } = draft;

  const playerIds = [player1Id, player2Id];

  const { data: players, isLoading: playersLoading } =
    api.users.getUsersByIds.useQuery(
      {
        userIds: playerIds,
      },
      {
        enabled: !!draft && playerIds.length === 2,
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

  const { canPick, reason } = useMemo(() => {
    if (!user || !userAllowedPoints) return { canPick: true };
    return canStartGame(currentUserCards, userAllowedPoints);
  }, [currentUserCards, userAllowedPoints, user]);

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
            {player1Name} {player1Status}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("availablePoints")} ({player1Remaining})
          </p>
        </div>
        <div
          className={`border-2 rounded-lg p-2 h-[20vh] flex flex-col ${
            isPlayer1Turn ? "border-green-500" : "border-gray-300"
          }`}
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
                  {t(`cardType.${card.unit_type}`)}, {card.cost}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-sm">
            {player2Name} {player2Status}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("availablePoints")} ({player2Remaining})
          </p>
        </div>
        <div
          className={`border-2 rounded-lg p-2 h-[20vh] flex flex-col ${
            isPlayer2Turn ? "border-green-500" : "border-gray-300"
          }`}
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
                  {t(`cardType.${card.unit_type}`)}, {card.cost}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      <DraftActionButtons
        draftId={draft.id}
        canStartGame={canPick}
        startGameRestrictionReason={reason}
      />
    </div>
  );
}
