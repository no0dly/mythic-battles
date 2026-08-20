/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { sharedDraftsRouter } from "../shared-drafts";
import type { Card, SharedDraftRow } from "@/types/database.types";
import { MAP_SIDE } from "@/types/constants";
import { makeCard } from "@/utils/shared-drafts/__tests__/makeCard";
import {
  SHARED_DRAFT_ID,
  SPARTANS_ID,
  TARTARUS_MAP_ID,
  TEST_SHARE_SLUG,
  ZEUS_ID,
} from "@/utils/shared-drafts/__tests__/constants";
import {
  FAILED_TO_FETCH_CARDS,
  SHARED_DRAFT_NOT_FOUND,
} from "../shared-drafts/constants";

const mockCard = makeCard();

const mockSharedDraftRow: SharedDraftRow = {
  id: SHARED_DRAFT_ID,
  slug: TEST_SHARE_SLUG,
  title: "Test share",
  player1_card_ids: [ZEUS_ID],
  player2_card_ids: [SPARTANS_ID],
  map_id: TARTARUS_MAP_ID,
  map_side: MAP_SIDE.B,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const createMockContext = (overrides?: {
  sharedDraft?: { data: SharedDraftRow | null; error: unknown };
  cards?: { data: Card[] | null; error: unknown };
}) => {
  const sharedDraftResult = overrides?.sharedDraft ?? {
    data: mockSharedDraftRow,
    error: null,
  };
  const cardsResult = overrides?.cards ?? {
    data: [mockCard],
    error: null,
  };

  return {
    headers: new Headers(),
    session: null,
    supabase: {
      from: vi.fn((table: string) => {
        if (table === "shared_drafts") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => sharedDraftResult),
              })),
            })),
          };
        }

        return {
          select: vi.fn(() => ({
            in: vi.fn(() => cardsResult),
          })),
        };
      }),
    },
  };
};

describe("sharedDraftsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBySlug", () => {
    it("returns a shared draft with cards", async () => {
      const ctx = createMockContext() as any;
      const caller = sharedDraftsRouter.createCaller(ctx);

      const result = await caller.getBySlug({ slug: TEST_SHARE_SLUG });

      expect(result.slug).toBe(TEST_SHARE_SLUG);
      expect(result.title).toBe("Test share");
      expect(result.player1_card_ids).toEqual([ZEUS_ID]);
      expect(result.player2_card_ids).toEqual([SPARTANS_ID]);
      expect(result.map_id).toBe(TARTARUS_MAP_ID);
      expect(result.map_side).toBe(MAP_SIDE.B);
      expect(result.cards).toEqual([mockCard]);
      expect(ctx.supabase.from).toHaveBeenCalledWith("shared_drafts");
      expect(ctx.supabase.from).toHaveBeenCalledWith("cards");
    });

    it("throws NOT_FOUND when the slug does not exist", async () => {
      const ctx = createMockContext({
        sharedDraft: { data: null, error: { message: "Not found" } },
      }) as any;
      const caller = sharedDraftsRouter.createCaller(ctx);

      await expect(
        caller.getBySlug({ slug: "missing-share" }),
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.getBySlug({ slug: "missing-share" }),
      ).rejects.toThrow(SHARED_DRAFT_NOT_FOUND);
    });

    it("rejects invalid slugs", async () => {
      const ctx = createMockContext() as any;
      const caller = sharedDraftsRouter.createCaller(ctx);

      await expect(
        caller.getBySlug({ slug: "Invalid Slug" }),
      ).rejects.toThrow();
    });

    it("throws when card fetch fails", async () => {
      const ctx = createMockContext({
        cards: { data: null, error: { message: "Database error" } },
      }) as any;
      const caller = sharedDraftsRouter.createCaller(ctx);

      await expect(
        caller.getBySlug({ slug: TEST_SHARE_SLUG }),
      ).rejects.toThrow(FAILED_TO_FETCH_CARDS);
    });
  });
});
