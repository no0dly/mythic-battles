import { useTranslation } from "react-i18next";
import type { Card, DraftPick, Team, UserSubset } from "@/types/database.types";
import type { DraftWithRelations } from "@/utils/drafts/interfaces";
import { createCardIdMap } from "@/utils/cards/createCardIdMap";
import { getPlayerName, parseDraftHistory } from "@/utils/drafts/helpers";
import { sumPlayerSpentPoints } from "@/utils/drafts/points";
import { getUpcomingTurns } from "@/utils/drafts/turnOrder";
import { getReadyPlayerIds } from "@/utils/drafts/readyChecks";
import { getDraftSeats } from "@/utils/drafts/seats";
import type { PlayerAccent } from "@/utils/drafts/playerAccents";

const UPCOMING_TURNS_COUNT = 4;

export interface DraftSeatInfo {
  userId: string;
  seatLabel: string;
  name: string;
  team: Team | null;
  accent: PlayerAccent;
  cards: Card[];
  spent: number;
  remaining: number;
  strategicValue: number;
  isTurn: boolean;
  isReady: boolean;
}

interface UseMultiplayerDraftSeatsParams {
  draft: DraftWithRelations;
  cards: Card[] | undefined;
  players: UserSubset[] | undefined;
  userAllowedPoints: number | undefined;
}

export function useMultiplayerDraftSeats({
  draft,
  cards,
  players,
  userAllowedPoints,
}: UseMultiplayerDraftSeatsParams) {
  const { t } = useTranslation();
  const allowedPoints = userAllowedPoints ?? 0;
  const cardMap = createCardIdMap(cards);
  const picks: DraftPick[] = parseDraftHistory(draft.draft_history)?.picks ?? [];

  const costById = new Map<string, number>();
  for (const pick of picks) {
    costById.set(pick.card_id, cardMap.get(pick.card_id)?.cost ?? 0);
  }

  const draftSeats = getDraftSeats(draft);
  const seatOrder = draftSeats.map((seat) => seat.userId);
  const readyIds = getReadyPlayerIds(draft.readyCheck);
  const remainingFor = (userId: string) =>
    allowedPoints - sumPlayerSpentPoints(picks, userId, costById);

  const seats: DraftSeatInfo[] = draftSeats.map(({ userId, seatLabel, team, accent }) => {
    const playerCards = picks
      .filter((pick) => pick.player_id === userId)
      .map((pick) => cardMap.get(pick.card_id))
      .filter((card): card is Card => !!card);
    const spent = sumPlayerSpentPoints(picks, userId, costById);

    return {
      userId,
      seatLabel,
      name: getPlayerName(players, userId, "draftSeatFallbackName", t),
      team,
      accent,
      cards: playerCards,
      spent,
      remaining: allowedPoints - spent,
      strategicValue: playerCards.reduce((sum, card) => sum + card.strategic_value, 0),
      isTurn: draft.current_turn_user_id === userId,
      isReady: readyIds.includes(userId),
    };
  });

  const upcomingTurns = getUpcomingTurns(
    seatOrder,
    draft.turn_index ?? 0,
    UPCOMING_TURNS_COUNT,
    (userId) => remainingFor(userId) <= 0
  )
    .map((userId) => seats.find((seat) => seat.userId === userId))
    .filter((seat): seat is DraftSeatInfo => !!seat);

  const draftRound =
    seatOrder.length > 0 ? Math.floor((draft.turn_index ?? 0) / seatOrder.length) + 1 : 1;

  return { seats, picks, upcomingTurns, draftRound };
}
