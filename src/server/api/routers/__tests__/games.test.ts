/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { gamesRouter } from "../games";
import { SOLO_PRACTICE_PLAYER_ID, WIN_CONDITION } from "@/types/constants";

const PLAYER1_ID = "00000000-0000-0000-0000-000000000011";
const PLAYER2_ID = "00000000-0000-0000-0000-000000000022";
const OUTSIDER_ID = "00000000-0000-0000-0000-000000000099";
const GAME_ID = "10000000-0000-0000-0000-000000000000";
const SESSION_ID = "20000000-0000-0000-0000-000000000000";

const makeAwaitableEq = (result: { data: unknown; error: unknown }) => {
  const node: Record<string, any> = {};
  node.eq = vi.fn(() => node);
  node.select = vi.fn(() => node);
  node.single = vi.fn(async () => result);
  node.then = (
    onFulfilled: (value: { data: unknown; error: unknown }) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return node;
};

const createFinishGameContext = (options?: {
  userId?: string;
  player2Id?: string;
  sessionError?: unknown;
}) => {
  const userId = options?.userId ?? PLAYER1_ID;
  const player2Id = options?.player2Id ?? PLAYER2_ID;
  const session = {
    player1_id: PLAYER1_ID,
    player2_id: player2Id,
    player1_session_score: 0,
    player2_session_score: 0,
  };

  const from = vi.fn((table: string) => {
    if (table === "sessions") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: options?.sessionError ? null : session,
              error: options?.sessionError ?? null,
            })),
          })),
        })),
        update: vi.fn(() =>
          makeAwaitableEq({ data: { id: SESSION_ID }, error: null })
        ),
      };
    }

    if (table === "games") {
      return {
        update: vi.fn(() =>
          makeAwaitableEq({ data: { id: GAME_ID }, error: null })
        ),
      };
    }

    throw new Error(`Unexpected table ${table}`);
  });

  return {
    session: {
      user: { id: userId, email: "player1@example.com" },
    },
    supabase: { from },
    headers: new Headers(),
  };
};

describe("gamesRouter.finishGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finishes a ranked game without writing users from the session client", async () => {
    const ctx = createFinishGameContext();
    const caller = gamesRouter.createCaller(ctx as any);

    const result = await caller.finishGame({
      gameId: GAME_ID,
      sessionId: SESSION_ID,
      winnerId: PLAYER2_ID,
      winCondition: WIN_CONDITION.OBTAINED_GEMS,
    });

    expect(result).toEqual({ success: true });
    expect(ctx.supabase.from).toHaveBeenCalledWith("games");
    expect(ctx.supabase.from).toHaveBeenCalledWith("sessions");
    expect(ctx.supabase.from).not.toHaveBeenCalledWith("users");
  });

  it("does not require a winner for practice games", async () => {
    const ctx = createFinishGameContext({
      player2Id: SOLO_PRACTICE_PLAYER_ID,
    });
    const caller = gamesRouter.createCaller(ctx as any);

    await expect(
      caller.finishGame({
        gameId: GAME_ID,
        sessionId: SESSION_ID,
      })
    ).resolves.toEqual({ success: true });
  });

  it("rejects callers who are not in the session", async () => {
    const ctx = createFinishGameContext({ userId: OUTSIDER_ID });
    const caller = gamesRouter.createCaller(ctx as any);

    await expect(
      caller.finishGame({
        gameId: GAME_ID,
        sessionId: SESSION_ID,
        winnerId: PLAYER1_ID,
        winCondition: WIN_CONDITION.KILLED_DIVINITY,
      })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
