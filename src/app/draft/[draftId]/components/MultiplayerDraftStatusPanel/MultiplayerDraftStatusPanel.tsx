"use client";

import { useTranslation } from "react-i18next";
import type { Card as CardType } from "@/types/database.types";
import type { DraftWithRelations } from "@/utils/drafts/interfaces";
import { useMultiplayerDraftSeats } from "@/hooks";
import { useUserProfile } from "@/hooks/useUserProfile";
import { api } from "@/trpc/client";
import { canStartGame } from "@/utils/drafts";
import { getInitialRolls, isPracticeDraft } from "@/utils/drafts/helpers";
import { getDraftPlayerIds, SEAT_LABELS } from "@/utils/drafts/turnOrder";
import {
  DraftActionButtons,
  DraftStatusPanelSkeleton,
} from "../DraftStatusPanel/components";
import { MapSection } from "../MapSection/MapSection";
import { MultiplayerSeatCard, MultiplayerUpcomingTurns } from "./components";

interface MultiplayerDraftStatusPanelProps {
  draft: DraftWithRelations;
  cards: CardType[] | undefined;
}

export function MultiplayerDraftStatusPanel({ draft, cards }: MultiplayerDraftStatusPanelProps) {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const playerIds = getDraftPlayerIds(draft);
  const isPractice = isPracticeDraft(draft);

  const { data: players, isLoading: playersLoading } = api.users.getUsersByIds.useQuery(
    { userIds: playerIds },
    { enabled: playerIds.length > 0 }
  );

  const { data: gameSettings, isLoading: gameLoading } = api.games.getGameSettings.useQuery(
    { game_id: draft.game_id },
    { enabled: !!draft.game_id }
  );

  const userAllowedPoints = gameSettings?.user_allowed_points;
  const { seats, picks, upcomingTurns, draftRound } = useMultiplayerDraftSeats({
    draft,
    cards,
    players,
    userAllowedPoints,
  });

  const costOverrides = new Map(
    picks
      .filter((pick) => pick.cost_override !== undefined)
      .map((pick) => [pick.card_id, pick.cost_override!])
  );

  const startCheck = (() => {
    if (!user || !userAllowedPoints) return { canPick: true };
    const seatsToCheck = isPractice ? seats : seats.filter((seat) => seat.userId === user.id);
    for (const seat of seatsToCheck) {
      const result = canStartGame(seat.cards, seat.remaining);
      if (!result.canPick) return result;
    }
    return { canPick: true };
  })();

  if (playersLoading || gameLoading) {
    return <DraftStatusPanelSkeleton />;
  }

  const initialRolls = getInitialRolls(draft)
    .map(({ roll }, index) => `${SEAT_LABELS[index]} ${roll}`)
    .join(" · ");
  const currentSeat = seats.find((seat) => seat.isTurn && seat.remaining > 0);

  return (
    <div className="space-y-4" data-testid="multiplayer-draft-status-panel">
      <div className="space-y-1 mb-3 pb-2">
        <p>
          {t("initialRoll")} {initialRolls}
        </p>
        <p>
          {t("draftRound")} {draftRound}
        </p>
        <MultiplayerUpcomingTurns current={currentSeat} upcoming={upcomingTurns} />
      </div>

      <div className="space-y-5">
        {seats.map((seat) => (
          <MultiplayerSeatCard
            key={seat.userId}
            seat={seat}
            isCurrentUser={seat.userId === user?.id}
            costOverrides={costOverrides}
          />
        ))}
      </div>

      <MapSection mapId={draft.map_id} mapSide={draft.map_side} />

      <DraftActionButtons
        draftId={draft.id}
        draftStatus={draft.draft_status}
        canStartGame={startCheck.canPick}
        startGameRestrictionReason={startCheck.reason}
        resetRequest={draft.resetRequest}
        readyCheck={draft.readyCheck}
        isPracticeDraft={isPractice}
        playerCount={seats.length}
      />
    </div>
  );
}
