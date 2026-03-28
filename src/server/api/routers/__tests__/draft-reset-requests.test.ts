/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { draftResetRequestsRouter } from "../draft-reset-requests";
import {
  DRAFT_STATUS,
  DRAFT_RESET_REQUEST_STATUS,
  CARD_TYPES,
  ALL_VALUE,
} from "@/types/constants";
import type { Card, DraftResetRequest } from "@/types/database.types";

const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000002";
const TEST_DRAFT_ID = "10000000-0000-0000-0000-000000000000";
const TEST_GAME_ID = "20000000-0000-0000-0000-000000000000";
const TEST_REQUEST_ID = "30000000-0000-0000-0000-000000000000";

const createResetRequest = (
  overrides: Partial<DraftResetRequest> = {},
): DraftResetRequest => ({
  id: TEST_REQUEST_ID,
  draft_id: TEST_DRAFT_ID,
  game_id: TEST_GAME_ID,
  requester_id: TEST_USER_ID,
  opponent_id: OTHER_USER_ID,
  status: DRAFT_RESET_REQUEST_STATUS.PENDING,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  responded_at: null,
  ...overrides,
});

const makeCard = (id: string): Card => ({
  id,
  unit_name: `Card ${id}`,
  unit_type: CARD_TYPES.MONSTER,
  cost: 1,
  amount_of_card_activations: 1,
  strategic_value: 1,
  talents: [],
  class: [],
  origin: null,
  extra: null,
  image_url: "",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
});

// Minimal update chain that doesn't throw
const makeUpdateChain = () => {
  const eq = vi.fn(() => ({ eq: vi.fn(() => ({})) }));
  const update = vi.fn(() => ({ eq }));
  return { update, eq };
};

// Select chain returning a single row
const makeSingleSelectChain = <T>(data: T | null, error: unknown = null) => {
  const single = vi.fn(() => ({ data, error }));
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  return { select, eq, single };
};

// Select chain with maybeSingle
const makeMaybeSingleChain = <T>(data: T | null, error: unknown = null) => {
  const maybeSingle = vi.fn(() => ({ data, error }));
  const eq2 = vi.fn(() => ({ maybeSingle }));
  const eq1 = vi.fn(() => ({ eq: eq2, maybeSingle }));
  const select = vi.fn(() => ({ eq: eq1 }));
  return { select, eq1, eq2, maybeSingle };
};

// Insert chain returning a single row
const makeInsertChain = <T>(data: T | null, error: unknown = null) => {
  const single = vi.fn(() => ({ data, error }));
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  return { insert, select, single };
};

// ─── requestReset ─────────────────────────────────────────────────────────────

describe("draftResetRequestsRouter.requestReset", () => {
  beforeEach(() => vi.clearAllMocks());

  const createRequestResetContext = (overrides?: {
    draftData?: object | null;
    draftError?: unknown;
    existingRequest?: object | null;
    insertedRequest?: DraftResetRequest | null;
    insertError?: unknown;
  }) => {
    const draftData = overrides?.draftData ?? {
      player1_id: TEST_USER_ID,
      player2_id: OTHER_USER_ID,
      draft_status: DRAFT_STATUS.DRAFT,
      game_id: TEST_GAME_ID,
    };
    const insertedRequest =
      overrides?.insertedRequest ?? createResetRequest();

    let draftsCallCount = 0;
    let resetRequestsCallCount = 0;
    const gameUpdateChain = makeUpdateChain();

    const from = vi.fn((table: string) => {
      switch (table) {
        case "drafts": {
          draftsCallCount++;
          if (draftsCallCount === 1) {
            const single = vi.fn(() => ({
              data: overrides?.draftData !== undefined ? overrides.draftData : draftData,
              error: overrides?.draftError ?? null,
            }));
            const eq = vi.fn(() => ({ single }));
            const select = vi.fn(() => ({ eq }));
            return { select };
          }
          return makeUpdateChain();
        }
        case "draft_reset_requests": {
          resetRequestsCallCount++;
          if (resetRequestsCallCount === 1) {
            // Check for existing pending request
            return makeMaybeSingleChain(overrides?.existingRequest ?? null);
          }
          // Insert new request
          return makeInsertChain(
            overrides?.insertedRequest !== undefined
              ? overrides.insertedRequest
              : insertedRequest,
            overrides?.insertError ?? null,
          );
        }
        case "games":
          return gameUpdateChain;
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    return {
      ctx: { supabase: { from }, session: { user: { id: TEST_USER_ID } } },
      spies: { from, gameUpdateChain },
    };
  };

  it("creates a reset request and updates draft + game status", async () => {
    const { ctx } = createRequestResetContext();
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    const result = await caller.requestReset({ draft_id: TEST_DRAFT_ID });

    expect(result.id).toBe(TEST_REQUEST_ID);
    expect(result.status).toBe(DRAFT_RESET_REQUEST_STATUS.PENDING);
  });

  it("throws NOT_FOUND when draft does not exist", async () => {
    const { ctx } = createRequestResetContext({
      draftData: null,
      draftError: { message: "not found" },
    });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.requestReset({ draft_id: TEST_DRAFT_ID }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws FORBIDDEN when user is not a participant", async () => {
    const { ctx } = createRequestResetContext({
      draftData: {
        player1_id: "other-1",
        player2_id: "other-2",
        draft_status: DRAFT_STATUS.DRAFT,
        game_id: TEST_GAME_ID,
      },
    });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.requestReset({ draft_id: TEST_DRAFT_ID }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws BAD_REQUEST when draft is not in DRAFT status", async () => {
    const { ctx } = createRequestResetContext({
      draftData: {
        player1_id: TEST_USER_ID,
        player2_id: OTHER_USER_ID,
        draft_status: DRAFT_STATUS.FINISHED,
        game_id: TEST_GAME_ID,
      },
    });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.requestReset({ draft_id: TEST_DRAFT_ID }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws BAD_REQUEST when a pending reset request already exists", async () => {
    const { ctx } = createRequestResetContext({
      existingRequest: { id: "existing-request-id" },
    });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.requestReset({ draft_id: TEST_DRAFT_ID }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── cancelReset ──────────────────────────────────────────────────────────────

describe("draftResetRequestsRouter.cancelReset", () => {
  beforeEach(() => vi.clearAllMocks());

  const createCancelResetContext = (overrides?: {
    request?: DraftResetRequest | null;
    fetchError?: unknown;
    userId?: string;
  }) => {
    const request = overrides?.request ?? createResetRequest();
    const userId = overrides?.userId ?? TEST_USER_ID;

    let resetRequestsCallCount = 0;

    const from = vi.fn((table: string) => {
      switch (table) {
        case "draft_reset_requests": {
          resetRequestsCallCount++;
          if (resetRequestsCallCount === 1) {
            const single = vi.fn(() => ({
              data: overrides?.request !== undefined ? overrides.request : request,
              error: overrides?.fetchError ?? null,
            }));
            const eq = vi.fn(() => ({ single }));
            const select = vi.fn(() => ({ eq }));
            return { select };
          }
          return makeUpdateChain();
        }
        case "drafts":
          return makeUpdateChain();
        case "games":
          return makeUpdateChain();
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    return {
      ctx: { supabase: { from }, session: { user: { id: userId } } },
    };
  };

  it("marks request as CANCELLED and reverts draft + game to DRAFT status", async () => {
    const { ctx } = createCancelResetContext();
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    const result = await caller.cancelReset({ reset_request_id: TEST_REQUEST_ID });

    expect(result).toEqual({ success: true });
    // Verify 3 tables were touched (draft_reset_requests x2, drafts, games)
    expect(ctx.supabase.from).toHaveBeenCalledWith("draft_reset_requests");
    expect(ctx.supabase.from).toHaveBeenCalledWith("drafts");
    expect(ctx.supabase.from).toHaveBeenCalledWith("games");
  });

  it("throws NOT_FOUND when reset request does not exist", async () => {
    const { ctx } = createCancelResetContext({
      request: null,
      fetchError: { message: "not found" },
    });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.cancelReset({ reset_request_id: TEST_REQUEST_ID }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws FORBIDDEN when user is not the requester", async () => {
    const { ctx } = createCancelResetContext({ userId: OTHER_USER_ID });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.cancelReset({ reset_request_id: TEST_REQUEST_ID }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws BAD_REQUEST when request is not pending", async () => {
    const { ctx } = createCancelResetContext({
      request: createResetRequest({ status: DRAFT_RESET_REQUEST_STATUS.CANCELLED }),
    });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.cancelReset({ reset_request_id: TEST_REQUEST_ID }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── acceptReset ──────────────────────────────────────────────────────────────

describe("draftResetRequestsRouter.acceptReset", () => {
  beforeEach(() => vi.clearAllMocks());

  const DRAFT_SETTINGS = {
    draft_size: 1,
    gods_amount: 0,
    titans_amount: 0,
    troop_attachment_amount: 0,
    origins: [ALL_VALUE],
    maps: [ALL_VALUE],
  };

  const TEST_CARDS = [makeCard("card-1"), makeCard("card-2"), makeCard("card-3")];

  const createAcceptResetContext = (overrides?: {
    request?: DraftResetRequest | null;
    fetchError?: unknown;
    userId?: string;
    draftSettings?: object;
    cards?: Card[];
  }) => {
    const request = overrides?.request ?? createResetRequest();
    const userId = overrides?.userId ?? OTHER_USER_ID; // opponent accepts
    const draftSettings = overrides?.draftSettings ?? DRAFT_SETTINGS;
    const cards = overrides?.cards ?? TEST_CARDS;

    let resetRequestsCallCount = 0;
    let draftsCallCount = 0;
    let gamesCallCount = 0;

    const from = vi.fn((table: string) => {
      switch (table) {
        case "draft_reset_requests": {
          resetRequestsCallCount++;
          if (resetRequestsCallCount === 1) {
            const single = vi.fn(() => ({
              data: overrides?.request !== undefined ? overrides.request : request,
              error: overrides?.fetchError ?? null,
            }));
            const eq = vi.fn(() => ({ single }));
            const select = vi.fn(() => ({ eq }));
            return { select };
          }
          return makeUpdateChain();
        }
        case "drafts": {
          draftsCallCount++;
          if (draftsCallCount === 1) {
            const single = vi.fn(() => ({
              data: { player1_id: TEST_USER_ID, player2_id: OTHER_USER_ID, game_id: TEST_GAME_ID },
              error: null,
            }));
            const eq = vi.fn(() => ({ single }));
            const select = vi.fn(() => ({ eq }));
            return { select };
          }
          return makeUpdateChain();
        }
        case "games": {
          gamesCallCount++;
          if (gamesCallCount === 1) {
            const single = vi.fn(() => ({
              data: { draft_settings: draftSettings },
              error: null,
            }));
            const eq = vi.fn(() => ({ single }));
            const select = vi.fn(() => ({ eq }));
            return { select };
          }
          return makeUpdateChain();
        }
        case "cards":
          return { select: vi.fn(() => ({ data: cards, error: null })) };
        case "maps":
          return { select: vi.fn(() => ({ data: [], error: null })) };
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    return {
      ctx: { supabase: { from }, session: { user: { id: userId } } },
    };
  };

  it("resets draft with new pool and sets status back to DRAFT", async () => {
    const { ctx } = createAcceptResetContext();
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    const result = await caller.acceptReset({ reset_request_id: TEST_REQUEST_ID });

    expect(result).toEqual({ success: true });
    expect(ctx.supabase.from).toHaveBeenCalledWith("draft_reset_requests");
    expect(ctx.supabase.from).toHaveBeenCalledWith("drafts");
    expect(ctx.supabase.from).toHaveBeenCalledWith("games");
    expect(ctx.supabase.from).toHaveBeenCalledWith("cards");
    expect(ctx.supabase.from).toHaveBeenCalledWith("maps");
  });

  it("throws NOT_FOUND when reset request does not exist", async () => {
    const { ctx } = createAcceptResetContext({
      request: null,
      fetchError: { message: "not found" },
    });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.acceptReset({ reset_request_id: TEST_REQUEST_ID }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws FORBIDDEN when user is not the opponent", async () => {
    const { ctx } = createAcceptResetContext({ userId: TEST_USER_ID }); // requester, not opponent
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.acceptReset({ reset_request_id: TEST_REQUEST_ID }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws BAD_REQUEST when request is not pending", async () => {
    const { ctx } = createAcceptResetContext({
      request: createResetRequest({ status: DRAFT_RESET_REQUEST_STATUS.ACCEPTED }),
    });
    const caller = draftResetRequestsRouter.createCaller(ctx as any);

    await expect(
      caller.acceptReset({ reset_request_id: TEST_REQUEST_ID }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
