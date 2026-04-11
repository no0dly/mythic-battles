/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { draftReadyChecksRouter } from "../draft-ready-checks";
import { DRAFT_STATUS, DRAFT_READY_CHECK_STATUS } from "@/types/constants";
import type { DraftReadyCheck } from "@/types/database.types";

const TEST_USER_ID    = "00000000-0000-0000-0000-000000000001";
const OTHER_USER_ID   = "00000000-0000-0000-0000-000000000002";
const TEST_DRAFT_ID   = "10000000-0000-0000-0000-000000000000";
const TEST_GAME_ID    = "20000000-0000-0000-0000-000000000000";
const TEST_SESSION_ID = "30000000-0000-0000-0000-000000000000";
const TEST_CHECK_ID   = "40000000-0000-0000-0000-000000000000";

const baseDraftData = {
  player1_id: TEST_USER_ID,
  player2_id: OTHER_USER_ID,
  draft_status: DRAFT_STATUS.DRAFT,
  game_id: TEST_GAME_ID,
};

const createReadyCheck = (overrides: Partial<DraftReadyCheck> = {}): DraftReadyCheck => ({
  id: TEST_CHECK_ID,
  draft_id: TEST_DRAFT_ID,
  game_id: TEST_GAME_ID,
  first_player_id: TEST_USER_ID,
  second_player_id: null,
  status: DRAFT_READY_CHECK_STATUS.PENDING,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

// select().eq().single()
const makeSingleSelectChain = <T>(data: T | null, error: unknown = null) => {
  const single = vi.fn(() => ({ data, error }));
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  return { select };
};

// select().eq().eq().maybeSingle()
const makeMaybeSingleChain = <T>(data: T | null, error: unknown = null) => {
  const maybeSingle = vi.fn(() => ({ data, error }));
  const eq2 = vi.fn(() => ({ maybeSingle }));
  const eq1 = vi.fn(() => ({ eq: eq2, maybeSingle }));
  const select = vi.fn(() => ({ eq: eq1 }));
  return { select };
};

// update().eq().eq()
const makeUpdateChain = () => {
  const eq = vi.fn(() => ({ eq: vi.fn(() => ({})) }));
  const update = vi.fn(() => ({ eq }));
  return { update };
};

// update().eq().select().single()
const makeUpdateSelectChain = <T>(data: T | null, error: unknown = null) => {
  const single = vi.fn(() => ({ data, error }));
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  return { update };
};

// delete().eq()
const makeDeleteChain = (error: unknown = null) => {
  const eq = vi.fn(() => ({ error }));
  return { delete: vi.fn(() => ({ eq })) };
};

// ─── getByDraftId ─────────────────────────────────────────────────────────────

describe("draftReadyChecksRouter.getByDraftId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no pending ready check exists", async () => {
    const from = vi.fn(() => makeMaybeSingleChain(null));
    const ctx = { supabase: { from }, session: { user: { id: TEST_USER_ID } } };
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    const result = await caller.getByDraftId({ draft_id: TEST_DRAFT_ID });

    expect(result).toBeNull();
  });

  it("returns the pending ready check when one exists", async () => {
    const readyCheck = createReadyCheck();
    const from = vi.fn(() => makeMaybeSingleChain(readyCheck));
    const ctx = { supabase: { from }, session: { user: { id: TEST_USER_ID } } };
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    const result = await caller.getByDraftId({ draft_id: TEST_DRAFT_ID });

    expect(result?.id).toBe(TEST_CHECK_ID);
    expect(result?.status).toBe(DRAFT_READY_CHECK_STATUS.PENDING);
  });
});

// ─── markReady — first player ─────────────────────────────────────────────────

describe("draftReadyChecksRouter.markReady — first player", () => {
  beforeEach(() => vi.clearAllMocks());

  const createFirstPlayerContext = (overrides?: {
    draftData?: object | null;
    draftError?: unknown;
    existingCheck?: DraftReadyCheck | null;
    insertError?: unknown;
    userId?: string;
  }) => {
    const userId = overrides?.userId ?? TEST_USER_ID;
    let readyChecksCallCount = 0;

    const from = vi.fn((table: string) => {
      switch (table) {
        case "drafts":
          return makeSingleSelectChain(
            overrides?.draftData !== undefined ? overrides.draftData : baseDraftData,
            overrides?.draftError ?? null,
          );
        case "draft_ready_checks": {
          readyChecksCallCount++;
          if (readyChecksCallCount === 1) {
            return makeMaybeSingleChain(overrides?.existingCheck ?? null);
          }
          return { insert: vi.fn(() => ({ error: overrides?.insertError ?? null })) };
        }
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    return { ctx: { supabase: { from }, session: { user: { id: userId } } } };
  };

  it("creates a ready check record and returns bothReady: false", async () => {
    const { ctx } = createFirstPlayerContext();
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    const result = await caller.markReady({ draft_id: TEST_DRAFT_ID });

    expect(result).toEqual({ bothReady: false });
  });

  it("throws NOT_FOUND when draft does not exist", async () => {
    const { ctx } = createFirstPlayerContext({ draftData: null, draftError: { message: "not found" } });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.markReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws FORBIDDEN when user is not a participant", async () => {
    const { ctx } = createFirstPlayerContext({
      draftData: { player1_id: "other-1", player2_id: "other-2", draft_status: DRAFT_STATUS.DRAFT, game_id: TEST_GAME_ID },
    });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.markReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws BAD_REQUEST when draft is not in DRAFT status", async () => {
    const { ctx } = createFirstPlayerContext({
      draftData: { ...baseDraftData, draft_status: DRAFT_STATUS.FINISHED },
    });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.markReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws BAD_REQUEST when draft has no game_id", async () => {
    const { ctx } = createFirstPlayerContext({
      draftData: { ...baseDraftData, game_id: null },
    });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.markReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws BAD_REQUEST when user is already marked as ready", async () => {
    const { ctx } = createFirstPlayerContext({
      existingCheck: createReadyCheck({ first_player_id: TEST_USER_ID }),
    });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.markReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── markReady — second player starts game ────────────────────────────────────

describe("draftReadyChecksRouter.markReady — second player starts game", () => {
  beforeEach(() => vi.clearAllMocks());

  const createSecondPlayerContext = (overrides?: {
    draftUpdateError?: unknown;
    gameError?: unknown;
  }) => {
    let draftsCallCount = 0;
    let readyChecksCallCount = 0;

    const from = vi.fn((table: string) => {
      switch (table) {
        case "drafts": {
          draftsCallCount++;
          if (draftsCallCount === 1) return makeSingleSelectChain(baseDraftData);
          return makeUpdateSelectChain(
            { id: TEST_DRAFT_ID, draft_status: DRAFT_STATUS.FINISHED },
            overrides?.draftUpdateError ?? null,
          );
        }
        case "draft_reset_requests":
          return makeUpdateChain();
        case "draft_ready_checks": {
          readyChecksCallCount++;
          if (readyChecksCallCount === 1) {
            // Existing check — first player was TEST_USER_ID, now OTHER_USER_ID is clicking
            return makeMaybeSingleChain(createReadyCheck({ first_player_id: TEST_USER_ID }));
          }
          return makeDeleteChain();
        }
        case "games":
          return makeUpdateSelectChain(
            { id: TEST_GAME_ID, session_id: TEST_SESSION_ID },
            overrides?.gameError ?? null,
          );
        case "sessions":
          return makeUpdateSelectChain({ id: TEST_SESSION_ID });
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    return {
      ctx: { supabase: { from }, session: { user: { id: OTHER_USER_ID } } },
      spies: { from },
    };
  };

  it("starts the game and returns bothReady: true", async () => {
    const { ctx } = createSecondPlayerContext();
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    const result = await caller.markReady({ draft_id: TEST_DRAFT_ID });

    expect(result.bothReady).toBe(true);
  });

  it("touches drafts, games, sessions, and calls draft_ready_checks twice (fetch + delete)", async () => {
    const { ctx, spies } = createSecondPlayerContext();
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await caller.markReady({ draft_id: TEST_DRAFT_ID });

    expect(spies.from).toHaveBeenCalledWith("drafts");
    expect(spies.from).toHaveBeenCalledWith("games");
    expect(spies.from).toHaveBeenCalledWith("sessions");
    const readyCheckCalls = spies.from.mock.calls.filter((c: string[]) => c[0] === "draft_ready_checks");
    expect(readyCheckCalls).toHaveLength(2);
  });

  it("expires pending reset requests before starting", async () => {
    const { ctx, spies } = createSecondPlayerContext();
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await caller.markReady({ draft_id: TEST_DRAFT_ID });

    expect(spies.from).toHaveBeenCalledWith("draft_reset_requests");
  });

  it("throws INTERNAL_SERVER_ERROR when draft update fails", async () => {
    const { ctx } = createSecondPlayerContext({ draftUpdateError: { message: "db error" } });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.markReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("throws INTERNAL_SERVER_ERROR when game update fails", async () => {
    const { ctx } = createSecondPlayerContext({ gameError: { message: "db error" } });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.markReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});

// ─── cancelReady ──────────────────────────────────────────────────────────────

describe("draftReadyChecksRouter.cancelReady", () => {
  beforeEach(() => vi.clearAllMocks());

  const createCancelContext = (overrides?: {
    existingCheck?: DraftReadyCheck | null;
    fetchError?: unknown;
    deleteError?: unknown;
    userId?: string;
  }) => {
    const userId = overrides?.userId ?? TEST_USER_ID;
    let readyChecksCallCount = 0;

    const from = vi.fn((table: string) => {
      if (table !== "draft_ready_checks") throw new Error(`Unexpected table: ${table}`);
      readyChecksCallCount++;
      if (readyChecksCallCount === 1) {
        return makeMaybeSingleChain(
          overrides?.existingCheck !== undefined ? overrides.existingCheck : createReadyCheck(),
          overrides?.fetchError ?? null,
        );
      }
      return makeDeleteChain(overrides?.deleteError ?? null);
    });

    return { ctx: { supabase: { from }, session: { user: { id: userId } } } };
  };

  it("deletes the ready check and returns cancelled: true", async () => {
    const { ctx } = createCancelContext();
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    const result = await caller.cancelReady({ draft_id: TEST_DRAFT_ID });

    expect(result).toEqual({ cancelled: true });
  });

  it("throws NOT_FOUND when no pending ready check exists", async () => {
    const { ctx } = createCancelContext({ existingCheck: null });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.cancelReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws FORBIDDEN when user is not the first player", async () => {
    // OTHER_USER_ID tries to cancel but first_player_id is TEST_USER_ID
    const { ctx } = createCancelContext({ userId: OTHER_USER_ID });
    const caller = draftReadyChecksRouter.createCaller(ctx as any);

    await expect(caller.cancelReady({ draft_id: TEST_DRAFT_ID }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
