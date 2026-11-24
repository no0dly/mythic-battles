import { DRAFT_STATUS, GAME_MODE, MAP_SIDE } from "@/types/constants";
import type { Draft } from "@/types/database.types";
import {
  PICK_TIMESTAMP,
  PLAYER_1_ID,
  PLAYER_2_ID,
  POOL_ONLY_CARD_ID,
  SOURCE_DRAFT_ID,
  SPARTANS_ID,
  TARTARUS_MAP_ID,
  ZEUS_ID,
} from "./constants";

export const makeDraft = (overrides: Partial<Draft> = {}): Draft => ({
  id: SOURCE_DRAFT_ID,
  game_id: SOURCE_DRAFT_ID,
  player1_id: PLAYER_1_ID,
  player2_id: PLAYER_2_ID,
  initial_roll: null,
  draft_status: DRAFT_STATUS.FINISHED,
  draft_history: {
    picks: [
      { card_id: SPARTANS_ID, player_id: PLAYER_2_ID, pick_number: 2, timestamp: PICK_TIMESTAMP },
      { card_id: ZEUS_ID, player_id: PLAYER_1_ID, pick_number: 1, timestamp: PICK_TIMESTAMP, cost_override: 4 },
    ],
  },
  current_turn_user_id: PLAYER_1_ID,
  created_at: PICK_TIMESTAMP,
  updated_at: PICK_TIMESTAMP,
  draft_pool: [ZEUS_ID, SPARTANS_ID, POOL_ONLY_CARD_ID],
  map_id: TARTARUS_MAP_ID,
  map_side: MAP_SIDE.A,
  mode: GAME_MODE.ONE_VS_ONE,
  player_ids: [PLAYER_1_ID, PLAYER_2_ID],
  player_teams: null,
  turn_order: null,
  ...overrides,
});
