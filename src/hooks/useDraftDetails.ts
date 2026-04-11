import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  Draft,
  Card as CardType,
  UserSubset,
  DraftPick,
  PlayerDeploymentSide,
} from "@/types/database.types";
import {
  parseDraftHistory,
  getPlayerCards,
  getPlayerName,
  parseInitialRoll,
} from "@/utils/drafts/helpers";
import { createCardIdMap } from "@/utils/cards/createCardIdMap";

interface UseDraftDetailsParams {
  draft: Draft;
  cards: CardType[] | undefined;
  players: UserSubset[] | undefined;
  userAllowedPoints: number | undefined;
}

interface UseDraftDetailsReturn {
  player1Cards: CardType[];
  player2Cards: CardType[];
  player1Name: string;
  player2Name: string;
  draftHistory: ReturnType<typeof parseDraftHistory>;
  picks: DraftPick[];
  initialRoll: ReturnType<typeof parseInitialRoll>;
  firstUserRoll: number;
  secondUserRoll: number;
  player1Spent: number;
  player2Spent: number;
  player1Remaining: number;
  player2Remaining: number;
  isPlayer1Turn: boolean;
  isPlayer2Turn: boolean;
  turnNumber: number;
  draftRound: number;
  player1Status: string;
  player2Status: string;
  player1Side: PlayerDeploymentSide | null;
  player2Side: PlayerDeploymentSide | null;
}

export function useDraftDetails({
  draft,
  cards,
  players,
  userAllowedPoints,
}: UseDraftDetailsParams): UseDraftDetailsReturn {
  const { t } = useTranslation();

  // Use default value if userAllowedPoints is undefined
  const allowedPoints = userAllowedPoints ?? 0;


  const cardMap = useMemo(() => createCardIdMap(cards), [cards]);

  // Calculate player cards using helper function
  const player1Cards = useMemo(
    () => getPlayerCards(draft, cardMap, draft.player1_id),
    [draft, cardMap]
  );

  const player2Cards = useMemo(
    () => getPlayerCards(draft, cardMap, draft.player2_id),
    [draft, cardMap]
  );

  // Get player names using helper function
  const player1Name = useMemo(
    () => getPlayerName(players, draft.player1_id, "player1", t),
    [players, draft.player1_id, t]
  );

  const player2Name = useMemo(
    () => getPlayerName(players, draft.player2_id, "player2", t),
    [players, draft.player2_id, t]
  );

  // Parse draft history and initial roll
  const draftHistory = useMemo(
    () => parseDraftHistory(draft.draft_history),
    [draft.draft_history]
  );

  const picks = useMemo(() => draftHistory?.picks || [], [draftHistory]);

  const initialRoll = useMemo(() => parseInitialRoll(draft), [draft]);
  const firstUserRoll = useMemo(
    () => initialRoll?.player1Roll ?? 0,
    [initialRoll]
  );
  const secondUserRoll = useMemo(
    () => initialRoll?.player2Roll ?? 0,
    [initialRoll]
  );

  // Calculate remaining points using picks directly so cost_override is respected
  const player1Spent = useMemo(
    () =>
      picks
        .filter((p) => p.player_id === draft.player1_id)
        .reduce((sum, pick) => {
          if (pick.cost_override !== undefined) return sum + pick.cost_override;
          return sum + (cardMap.get(pick.card_id)?.cost ?? 0);
        }, 0),
    [picks, draft.player1_id, cardMap]
  );

  const player2Spent = useMemo(
    () =>
      picks
        .filter((p) => p.player_id === draft.player2_id)
        .reduce((sum, pick) => {
          if (pick.cost_override !== undefined) return sum + pick.cost_override;
          return sum + (cardMap.get(pick.card_id)?.cost ?? 0);
        }, 0),
    [picks, draft.player2_id, cardMap]
  );

  const player1Remaining = useMemo(
    () => allowedPoints - player1Spent,
    [allowedPoints, player1Spent]
  );

  const player2Remaining = useMemo(
    () => allowedPoints - player2Spent,
    [allowedPoints, player2Spent]
  );

  // Determine current turn
  const isPlayer1Turn = useMemo(
    () => draft.current_turn_user_id === draft.player1_id,
    [draft.current_turn_user_id, draft.player1_id]
  );

  const isPlayer2Turn = useMemo(
    () => draft.current_turn_user_id === draft.player2_id,
    [draft.current_turn_user_id, draft.player2_id]
  );

  // Calculate turn number (each pick is a turn)
  const turnNumber = useMemo(() => picks.length + 1, [picks]);

  // Calculate draft round (each round has 2 picks - one per player)
  const draftRound = useMemo(
    () => Math.ceil(turnNumber / 2),
    [turnNumber]
  );

  // Determine player status — empty when player has spent all their points
  const player1Status = useMemo(
    () => (player1Remaining === 0 ? "" : isPlayer1Turn ? t("picking") : t("awaits")),
    [isPlayer1Turn, player1Remaining, t]
  );

  const player2Status = useMemo(
    () => (player2Remaining === 0 ? "" : isPlayer2Turn ? t("picking") : t("awaits")),
    [isPlayer2Turn, player2Remaining, t]
  );

  const player1Side = useMemo(
    () => draft.players_setup?.find((s) => s.userID === draft.player1_id)?.side ?? null,
    [draft.players_setup, draft.player1_id]
  );

  const player2Side = useMemo(
    () => draft.players_setup?.find((s) => s.userID === draft.player2_id)?.side ?? null,
    [draft.players_setup, draft.player2_id]
  );

  return {
    player1Cards,
    player2Cards,
    player1Name,
    player2Name,
    draftHistory,
    picks,
    initialRoll,
    firstUserRoll,
    secondUserRoll,
    player1Spent,
    player2Spent,
    player1Remaining,
    player2Remaining,
    isPlayer1Turn,
    isPlayer2Turn,
    turnNumber,
    draftRound,
    player1Status,
    player2Status,
    player1Side,
    player2Side,
  };
}

