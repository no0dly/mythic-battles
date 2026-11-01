import { describe, it, expect } from "vitest";
import {
  buildTurnOrder,
  computeNextMultiplayerTurn,
  getDraftPlayerIds,
  getTeammateIds,
  getUpcomingTurns,
  seatForTurn,
} from "../turnOrder";
import { computeNextTurn } from "../helpers";
import type { DraftPick } from "@/types/database.types";
import { GAME_MODE, TEAM } from "@/types/constants";

const A = "a";
const B = "b";
const C = "c";
const D = "d";
const ALLOWED_POINTS = 10;

const sequence = (seatCount: number, length: number) =>
  Array.from({ length }, (_, i) => "ABCD"[seatForTurn(i, seatCount)]).join("");

const pick = (playerId: string, cardId: string): DraftPick => ({
  card_id: cardId,
  player_id: playerId,
  pick_number: 1,
  timestamp: "2026-01-01T00:00:00.000Z",
});

describe("seatForTurn", () => {
  it("follows A B C | C B A | C B A for 3 players", () => {
    expect(sequence(3, 12)).toBe("ABCCBACBACBA");
  });

  it("follows A B C D | D C B A | D C B A for 4 players", () => {
    expect(sequence(4, 16)).toBe("ABCDDCBADCBADCBA");
  });
});

describe("buildTurnOrder", () => {
  it("orders free-for-all seats by roll, highest first", () => {
    const order = buildTurnOrder([
      { userID: A, roll: 10 },
      { userID: B, roll: 90 },
      { userID: C, roll: 50 },
    ]);
    expect(order).toEqual([B, C, A]);
  });

  it("keeps original order on tied rolls", () => {
    const order = buildTurnOrder([
      { userID: A, roll: 50 },
      { userID: B, roll: 50 },
      { userID: C, roll: 10 },
    ]);
    expect(order).toEqual([A, B, C]);
  });

  it("puts the top roller at A, their teammate at C, top of the other team at B", () => {
    const teams = { [A]: TEAM.FIRST, [B]: TEAM.FIRST, [C]: TEAM.SECOND, [D]: TEAM.SECOND };
    const order = buildTurnOrder(
      [
        { userID: A, roll: 20 },
        { userID: B, roll: 5 },
        { userID: C, roll: 99 },
        { userID: D, roll: 40 },
      ],
      teams
    );
    expect(order).toEqual([C, A, D, B]);
  });

  it("rejects uneven teams", () => {
    const teams = { [A]: TEAM.FIRST, [B]: TEAM.FIRST, [C]: TEAM.FIRST, [D]: TEAM.SECOND };
    expect(() =>
      buildTurnOrder(
        [A, B, C, D].map((userID, i) => ({ userID, roll: i })),
        teams
      )
    ).toThrow();
  });
});

describe("computeNextMultiplayerTurn", () => {
  const costs = new Map([
    ["full", ALLOWED_POINTS],
    ["cheap", 1],
  ]);

  it("advances along the sequence", () => {
    const next = computeNextMultiplayerTurn({
      turnOrder: [A, B, C],
      turnIndex: 2,
      picks: [],
      playerAllowedPoints: ALLOWED_POINTS,
      cardCostById: costs,
    });
    expect(next).toEqual({ userId: C, turnIndex: 3 });
  });

  it("skips players who spent all their points", () => {
    const next = computeNextMultiplayerTurn({
      turnOrder: [A, B, C],
      turnIndex: 2,
      picks: [pick(C, "full")],
      playerAllowedPoints: ALLOWED_POINTS,
      cardCostById: costs,
    });
    expect(next).toEqual({ userId: B, turnIndex: 4 });
  });

  it("keeps the current turn when every player is done", () => {
    const next = computeNextMultiplayerTurn({
      turnOrder: [A, B, C],
      turnIndex: 4,
      picks: [pick(A, "full"), pick(B, "full"), pick(C, "full")],
      playerAllowedPoints: ALLOWED_POINTS,
      cardCostById: costs,
    });
    expect(next).toEqual({ userId: B, turnIndex: 4 });
  });
});

describe("computeNextTurn", () => {
  const costs = new Map([["cheap", 1]]);

  it("keeps 1v1 alternation for drafts without a mode", () => {
    const next = computeNextTurn(
      { player1_id: A, player2_id: B, current_turn_user_id: A },
      [pick(A, "cheap")],
      ALLOWED_POINTS,
      costs
    );
    expect(next.userId).toBe(B);
  });

  it("uses the multiplayer sequence for ffa3", () => {
    const next = computeNextTurn(
      {
        player1_id: A,
        player2_id: B,
        current_turn_user_id: C,
        mode: GAME_MODE.FFA3,
        turn_order: [A, B, C],
        turn_index: 2,
      },
      [pick(C, "cheap")],
      ALLOWED_POINTS,
      costs
    );
    expect(next).toEqual({ userId: C, turnIndex: 3 });
  });
});

describe("getUpcomingTurns", () => {
  it("lists the next seats and skips finished players", () => {
    expect(getUpcomingTurns([A, B, C, D], 0, 4)).toEqual([B, C, D, D]);
    expect(getUpcomingTurns([A, B, C, D], 0, 3, (id) => id === D)).toEqual([B, C, C]);
  });
});

describe("player helpers", () => {
  it("falls back to the legacy player pair", () => {
    expect(getDraftPlayerIds({ player1_id: A, player2_id: B })).toEqual([A, B]);
    expect(getDraftPlayerIds({ player1_id: A, player2_id: B, player_ids: [A, B, C] })).toEqual([A, B, C]);
  });

  it("finds teammates", () => {
    const teams = { [A]: TEAM.FIRST, [B]: TEAM.SECOND, [C]: TEAM.FIRST, [D]: TEAM.SECOND };
    expect(getTeammateIds(teams, A)).toEqual([C]);
    expect(getTeammateIds(null, A)).toEqual([]);
  });
});
