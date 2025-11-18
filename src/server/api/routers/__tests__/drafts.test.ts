/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { draftsRouter } from "../drafts";
import { DRAFT_STATUS, GAME_STATUS, SESSION_STATUS } from "@/types/constants";
import type { Draft } from "@/types/database.types";

const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000002";
const TEST_DRAFT_ID = "10000000-0000-0000-0000-000000000000";
const TEST_GAME_ID = "20000000-0000-0000-0000-000000000000";
const TEST_SESSION_ID = "30000000-0000-0000-0000-000000000000";

const createDraftRecord = (overrides: Partial<Draft> = {}): Draft => ({
  id: TEST_DRAFT_ID,
  game_id: TEST_GAME_ID,
  player1_id: TEST_USER_ID,
  player2_id: OTHER_USER_ID,
  initial_roll: null,
  draft_status: DRAFT_STATUS.DRAFT,
  draft_history: null,
  current_turn_user_id: TEST_USER_ID,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  draft_pool: [],
  ...overrides,
});

type SingleResult<T> = { data: T | null; error: unknown };

const createUpdateChain = <T>(
  result: SingleResult<T>,
  onUpdate?: (payload: unknown) => void,
) => {
  const single = vi.fn(() => result);
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn((payload: unknown) => {
    onUpdate?.(payload);
    return { eq };
  });

  return { update, eq, select, single };
};

const createSelectChain = <T>(result: SingleResult<T>) => {
  const single = vi.fn(() => result);
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  return { select, eq, single };
};

const createFinishDraftContext = (
  overrides?: Partial<{
    draftFetchResult: SingleResult<{
      player1_id: string;
      player2_id: string;
      draft_status: string;
      game_id: string | null;
    }>;
    updatedDraft: Draft;
    updatedGame: { id: string; session_id: string | null };
    sessionResult: SingleResult<{ id: string }>;
  }>,
) => {
  const draftFetchResult =
    overrides?.draftFetchResult ??
    ({
      data: {
        player1_id: TEST_USER_ID,
        player2_id: OTHER_USER_ID,
        draft_status: DRAFT_STATUS.DRAFT,
        game_id: TEST_GAME_ID,
      },
      error: null,
    } satisfies SingleResult<{
      player1_id: string;
      player2_id: string;
      draft_status: string;
      game_id: string;
    }>);

  const updatedDraft =
    overrides?.updatedDraft ??
    createDraftRecord({ draft_status: DRAFT_STATUS.FINISHED });
  const updatedGame =
    overrides?.updatedGame ?? { id: TEST_GAME_ID, session_id: TEST_SESSION_ID };
  const sessionResult =
    overrides?.sessionResult ??
    ({
      data: { id: TEST_SESSION_ID },
      error: null,
    } satisfies SingleResult<{ id: string }>);

  const draftSelectChain = createSelectChain(draftFetchResult);
  let lastDraftUpdatePayload: unknown;
  const draftUpdateChain = createUpdateChain(
    { data: updatedDraft, error: null },
    (payload) => {
      lastDraftUpdatePayload = payload;
    },
  );

  let lastGameUpdatePayload: unknown;
  const gameUpdateChain = createUpdateChain(
    { data: updatedGame, error: null },
    (payload) => {
      lastGameUpdatePayload = payload;
    },
  );

  let lastSessionUpdatePayload: unknown;
  const sessionUpdateChain = createUpdateChain(sessionResult, (payload) => {
    lastSessionUpdatePayload = payload;
  });

  const from = vi.fn((table: string) => {
    switch (table) {
      case "drafts":
        return {
          select: draftSelectChain.select,
          update: draftUpdateChain.update,
        };
      case "games":
        return {
          update: gameUpdateChain.update,
        };
      case "sessions":
        return {
          update: sessionUpdateChain.update,
        };
      default:
        throw new Error(`Unexpected table ${table}`);
    }
  });

  const ctx = {
    supabase: { from },
    session: {
      user: { id: TEST_USER_ID },
    },
  };

  return {
    ctx,
    spies: {
      draftSelectEq: draftSelectChain.eq,
      draftUpdatePayload: () => lastDraftUpdatePayload,
      gameUpdatePayload: () => lastGameUpdatePayload,
      sessionUpdatePayload: () => lastSessionUpdatePayload,
      gameUpdateEq: gameUpdateChain.eq,
      sessionUpdateEq: sessionUpdateChain.eq,
    },
  };
};

describe("draftsRouter.finishDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates draft, game, and session statuses", async () => {
    const { ctx, spies } = createFinishDraftContext();
    const caller = draftsRouter.createCaller(ctx as any);

    const result = await caller.finishDraft({ draft_id: TEST_DRAFT_ID });

    expect(result.draft_status).toBe(DRAFT_STATUS.FINISHED);
    expect(spies.draftUpdatePayload()).toEqual({
      draft_status: DRAFT_STATUS.FINISHED,
    });
    expect(spies.gameUpdatePayload()).toEqual({
      status: GAME_STATUS.IN_PROGRESS,
    });
    expect(spies.sessionUpdatePayload()).toEqual({
      status: SESSION_STATUS.IN_PROGRESS,
    });
    expect(spies.gameUpdateEq).toHaveBeenCalledWith("id", TEST_GAME_ID);
    expect(spies.sessionUpdateEq).toHaveBeenCalledWith("id", TEST_SESSION_ID);
  });

  it("throws when session status update fails", async () => {
    const { ctx } = createFinishDraftContext({
      sessionResult: { data: null, error: { message: "update failed" } },
    });
    const caller = draftsRouter.createCaller(ctx as any);

    await expect(
      caller.finishDraft({ draft_id: TEST_DRAFT_ID }),
    ).rejects.toThrow("Failed to start session after finishing draft");
  });
});

