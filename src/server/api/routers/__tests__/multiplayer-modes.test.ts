import { describe, it, expect } from "vitest";
import { resolveSessionPlayers } from "../sessions/players";
import { createDraftSeating } from "../drafts/seating";
import { resolveWinnerIds } from "../games/finishMultiplayerGame";
import {
  GAME_MODE,
  PRACTICE_PLAYER_IDS,
  SOLO_PRACTICE_PLAYER_ID,
  TEAM,
} from "@/types/constants";
import type { Session } from "@/types/database.types";

const CREATOR = "10000000-0000-0000-0000-000000000001";
const FRIEND_1 = "10000000-0000-0000-0000-000000000002";
const FRIEND_2 = "10000000-0000-0000-0000-000000000003";
const FRIEND_3 = "10000000-0000-0000-0000-000000000004";

const makeSession = (overrides: Partial<Session>): Session => ({
  id: "20000000-0000-0000-0000-000000000000",
  player1_id: CREATOR,
  player2_id: FRIEND_1,
  player1_session_score: 0,
  player2_session_score: 0,
  status: "inProgress",
  error_message: null,
  game_list: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  finished_at: null,
  ...overrides,
});

describe("resolveSessionPlayers", () => {
  it("keeps 1v1 exactly as before", () => {
    const result = resolveSessionPlayers({
      mode: GAME_MODE.ONE_VS_ONE,
      creatorId: CREATOR,
      opponentIds: [FRIEND_1],
    });
    expect(result).toMatchObject({
      playerIds: [CREATOR, FRIEND_1],
      player1Id: CREATOR,
      player2Id: FRIEND_1,
      teams: null,
      isPractice: false,
    });
  });

  it("requires the right number of opponents", () => {
    expect(() =>
      resolveSessionPlayers({
        mode: GAME_MODE.FFA3,
        creatorId: CREATOR,
        opponentIds: [FRIEND_1],
      })
    ).toThrow();
  });

  it("assigns 2v2 teams from the chosen teammate", () => {
    const result = resolveSessionPlayers({
      mode: GAME_MODE.TEAM_2V2,
      creatorId: CREATOR,
      opponentIds: [FRIEND_1, FRIEND_2, FRIEND_3],
      teammateId: FRIEND_2,
    });
    expect(result.teams).toEqual({
      [CREATOR]: TEAM.FIRST,
      [FRIEND_2]: TEAM.FIRST,
      [FRIEND_1]: TEAM.SECOND,
      [FRIEND_3]: TEAM.SECOND,
    });
  });

  it("fills practice seats with practice players and keeps the solo player in player2", () => {
    const result = resolveSessionPlayers({
      mode: GAME_MODE.FFA3,
      creatorId: CREATOR,
      opponentIds: [SOLO_PRACTICE_PLAYER_ID],
    });
    expect(result.isPractice).toBe(true);
    expect(result.player2Id).toBe(SOLO_PRACTICE_PLAYER_ID);
    expect(result.playerIds).toEqual([CREATOR, ...PRACTICE_PLAYER_IDS.slice(0, 2)]);
  });

  it("rejects practice players mixed with friends", () => {
    expect(() =>
      resolveSessionPlayers({
        mode: GAME_MODE.FFA3,
        creatorId: CREATOR,
        opponentIds: [FRIEND_1, SOLO_PRACTICE_PLAYER_ID],
      })
    ).toThrow();
  });
});

describe("createDraftSeating", () => {
  it("keeps the 1v1 alternating rule without a turn order", () => {
    const seating = createDraftSeating([CREATOR, FRIEND_1], GAME_MODE.ONE_VS_ONE);
    expect(seating.turn_order).toBeNull();
    expect([CREATOR, FRIEND_1]).toContain(seating.current_turn_user_id);
  });

  it("starts multiplayer drafts with seat A", () => {
    const seating = createDraftSeating([CREATOR, FRIEND_1, FRIEND_2], GAME_MODE.FFA3);
    expect(seating.turn_order).toHaveLength(3);
    expect(seating.current_turn_user_id).toBe(seating.turn_order?.[0]);
    expect(seating.turn_index).toBe(0);
  });
});

describe("resolveWinnerIds", () => {
  it("returns both members of the winning team", () => {
    const session = makeSession({
      mode: GAME_MODE.TEAM_2V2,
      player_ids: [CREATOR, FRIEND_1, FRIEND_2, FRIEND_3],
      player_teams: {
        [CREATOR]: TEAM.FIRST,
        [FRIEND_2]: TEAM.FIRST,
        [FRIEND_1]: TEAM.SECOND,
        [FRIEND_3]: TEAM.SECOND,
      },
    });
    expect(resolveWinnerIds(session, undefined, TEAM.SECOND)).toEqual([FRIEND_1, FRIEND_3]);
  });

  it("requires the free-for-all winner to be a player", () => {
    const session = makeSession({
      mode: GAME_MODE.FFA3,
      player_ids: [CREATOR, FRIEND_1, FRIEND_2],
    });
    expect(resolveWinnerIds(session, FRIEND_2)).toEqual([FRIEND_2]);
    expect(() => resolveWinnerIds(session, FRIEND_3)).toThrow();
  });
});
