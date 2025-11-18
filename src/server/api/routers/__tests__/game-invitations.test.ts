/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { gameInvitationsRouter } from "../game-invitations";
import { GAME_STATUS, SESSION_STATUS } from "@/types/constants";
import type { GameInvitation } from "@/types/database.types";

const INVITATION_ID = "40000000-0000-0000-0000-000000000000";
const GAME_ID = "50000000-0000-0000-0000-000000000000";
const SESSION_ID = "60000000-0000-0000-0000-000000000000";
const INVITER_ID = "70000000-0000-0000-0000-000000000000";
const INVITEE_ID = "80000000-0000-0000-0000-000000000000";

const baseInvitation: GameInvitation = {
  id: INVITATION_ID,
  game_id: GAME_ID,
  session_id: SESSION_ID,
  inviter_id: INVITER_ID,
  invitee_id: INVITEE_ID,
  status: "pending",
  message: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  responded_at: null,
};

type SingleResult<T> = { data: T | null; error: unknown };

const createSelectChain = <T>(result: SingleResult<T>) => {
  const single = vi.fn(() => result);
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  return { select, eq, single };
};

const createUpdateChain = <T>(
  result: SingleResult<T>,
  onUpdate?: (payload: unknown) => void,
) => {
  const single = result ? vi.fn(() => result) : vi.fn();
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn((payload: unknown) => {
    onUpdate?.(payload);
    return { eq };
  });
  return { update, eq, select, single };
};

const createGameInvitationsContext = (
  overrides?: Partial<{
    invitationFetch: SingleResult<GameInvitation>;
    invitationUpdate: SingleResult<GameInvitation>;
    sessionResult: SingleResult<{ id: string }>;
  }>,
) => {
  const invitationFetch = overrides?.invitationFetch ?? {
    data: baseInvitation,
    error: null,
  };
  const invitationUpdate = overrides?.invitationUpdate ?? {
    data: { ...baseInvitation, status: "accepted" },
    error: null,
  };
  const sessionResult =
    overrides?.sessionResult ??
    ({
      data: { id: SESSION_ID },
      error: null,
    } satisfies SingleResult<{ id: string }>);

  const invitationSelectChain = createSelectChain(invitationFetch);
  let lastInvitationUpdatePayload: unknown;
  const invitationUpdateChain = createUpdateChain(invitationUpdate, (payload) => {
    lastInvitationUpdatePayload = payload;
  });

  let lastGameUpdatePayload: unknown;
  const gameEq = vi.fn();
  const gameUpdate = vi.fn((payload: unknown) => {
    lastGameUpdatePayload = payload;
    return { eq: gameEq };
  });

  let lastSessionUpdatePayload: unknown;
  const sessionUpdateChain = createUpdateChain(sessionResult, (payload) => {
    lastSessionUpdatePayload = payload;
  });

  const from = vi.fn((table: string) => {
    switch (table) {
      case "game_invitations":
        return {
          select: invitationSelectChain.select,
          update: invitationUpdateChain.update,
        };
      case "games":
        return {
          update: gameUpdate,
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
    session: { user: { id: INVITEE_ID } },
  };

  return {
    ctx,
    spies: {
      invitationSelectEq: invitationSelectChain.eq,
      invitationUpdatePayload: () => lastInvitationUpdatePayload,
      gameUpdatePayload: () => lastGameUpdatePayload,
      gameEq,
      sessionUpdatePayload: () => lastSessionUpdatePayload,
      sessionEq: sessionUpdateChain.eq,
    },
  };
};

describe("gameInvitationsRouter.accept", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts invitation and updates game/session states", async () => {
    const { ctx, spies } = createGameInvitationsContext();
    const caller = gameInvitationsRouter.createCaller(ctx as any);

    const result = await caller.accept({ invitation_id: INVITATION_ID });

    expect(result.status).toBe("accepted");
    expect(spies.invitationUpdatePayload()).toMatchObject({
      status: "accepted",
    });
    expect(spies.gameUpdatePayload()).toEqual({
      status: GAME_STATUS.DRAFT,
    });
    expect(spies.sessionUpdatePayload()).toEqual({
      status: SESSION_STATUS.DRAFT,
    });
    expect(spies.gameEq).toHaveBeenCalledWith("id", GAME_ID);
    expect(spies.sessionEq).toHaveBeenCalledWith("id", SESSION_ID);
  });

  it("throws when session update fails", async () => {
    const { ctx } = createGameInvitationsContext({
      sessionResult: { data: null, error: { message: "session error" } },
    });
    const caller = gameInvitationsRouter.createCaller(ctx as any);

    await expect(
      caller.accept({ invitation_id: INVITATION_ID }),
    ).rejects.toThrow(
      "Failed to update session status after accepting invitation",
    );
  });
});

