import type { GameMode, InitialRoll, PlayerTeams } from "@/types/database.types";
import { GAME_MODE } from "@/types/constants";
import {
  buildTurnOrder,
  isMultiplayerMode,
  rollInitiative,
} from "@/utils/drafts/turnOrder";

export interface DraftSeating {
  initial_roll: InitialRoll[];
  current_turn_user_id: string;
  /** null for 1v1, which keeps its alternating turn rule */
  turn_order: string[] | null;
  turn_index: number;
}

/**
 * Rolls initiative and decides who picks first.
 * 1v1: highest roll starts, tie goes to player1 (unchanged behaviour).
 * Multiplayer: seats are built from the rolls (and teams for 2v2); seat A starts.
 */
export function createDraftSeating(
  playerIds: string[],
  mode: GameMode,
  teams?: PlayerTeams | null
): DraftSeating {
  const initial_roll = rollInitiative(playerIds);

  if (!isMultiplayerMode(mode)) {
    const [player1Roll, player2Roll] = initial_roll;
    return {
      initial_roll,
      current_turn_user_id:
        player2Roll.roll > player1Roll.roll ? player2Roll.userID : player1Roll.userID,
      turn_order: null,
      turn_index: 0,
    };
  }

  const turn_order = buildTurnOrder(
    initial_roll,
    mode === GAME_MODE.TEAM_2V2 ? teams : null
  );

  return {
    initial_roll,
    current_turn_user_id: turn_order[0],
    turn_order,
    turn_index: 0,
  };
}

/** Columns written only for multiplayer drafts, so 1v1 writes stay exactly as before. */
export function multiplayerSeatingColumns(seating: DraftSeating) {
  return seating.turn_order
    ? { turn_order: seating.turn_order, turn_index: seating.turn_index }
    : {};
}
