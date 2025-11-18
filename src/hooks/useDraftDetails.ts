import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Draft, Card as CardType, UserSubset } from "@/types/database.types";
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
  picks: Array<{ card_id: string; player_id: string; pick_number: number; timestamp: string }>;
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

  // Calculate remaining points for each player
  const player1Spent = useMemo(
    () => player1Cards.reduce((sum, card) => sum + card.cost, 0),
    [player1Cards]
  );

  const player2Spent = useMemo(
    () => player2Cards.reduce((sum, card) => sum + card.cost, 0),
    [player2Cards]
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

  // Determine player status
  const player1Status = useMemo(
    () => (isPlayer1Turn ? t("picking") : t("awaits")),
    [isPlayer1Turn, t]
  );

  const player2Status = useMemo(
    () => (isPlayer2Turn ? t("picking") : t("awaits")),
    [isPlayer2Turn, t]
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
    player2Status
  };
}

