/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { sharedDraftsRouter } from "../shared-drafts";
import { DRAFT_STATUS } from "@/types/constants";
import type { Draft } from "@/types/database.types";
import { makeDraft } from "@/utils/shared-drafts/__tests__/makeDraft";
import {
  OUTSIDER_ID,
  PLAYER_1_ID,
  SOURCE_DRAFT_ID,
  TEST_SHARE_SLUG,
} from "@/utils/shared-drafts/__tests__/constants";
import {
  DRAFT_NOT_FINISHED,
  DRAFT_NOT_FOUND,
  FAILED_TO_PUBLISH,
  NOT_A_DRAFT_PLAYER,
  UNIQUE_VIOLATION_CODE,
} from "../shared-drafts/constants";

const SHARE_TITLE = "Final round";

type QueryResult = { data: unknown; error: unknown };

const ok = (data: unknown): QueryResult => ({ data, error: null });

/** Each `from(table)` call takes the next queued result for that table. */
const createMockContext = (
  results: Record<string, QueryResult[]>,
  userId: string = PLAYER_1_ID,
) => {
  const queries: Record<string, any[]> = {};

  const from = vi.fn((table: string) => {
    const result = results[table]?.shift() ?? ok(null);
    const query: any = {};
    for (const method of ["select", "eq", "in", "insert", "delete"]) {
      query[method] = vi.fn(() => query);
    }
    query.single = vi.fn(async () => result);
    query.maybeSingle = vi.fn(async () => result);
    query.then = (resolve: (value: QueryResult) => unknown) => resolve(result);
    (queries[table] ??= []).push(query);
    return query;
  });

  return {
    ctx: {
      headers: new Headers(),
      session: { user: { id: userId } },
      supabase: { from },
    } as any,
    queries,
  };
};

const finishedDraft = (overrides: Partial<Draft> = {}) => ok(makeDraft(overrides));

describe("sharedDraftsRouter visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("publish", () => {
    it("inserts an anonymous snapshot and returns its slug", async () => {
      const { ctx, queries } = createMockContext({
        drafts: [finishedDraft()],
        shared_drafts: [ok(null), ok({ slug: TEST_SHARE_SLUG })],
      });

      const result = await sharedDraftsRouter
        .createCaller(ctx)
        .publish({ draftId: SOURCE_DRAFT_ID, title: SHARE_TITLE });

      expect(result).toEqual({ slug: TEST_SHARE_SLUG });
      const inserted = queries.shared_drafts[1].insert.mock.calls[0][0];
      expect(inserted.title).toBe(SHARE_TITLE);
      expect(inserted.slug).toMatch(/^final-round-[0-9a-f]{8}$/);
      expect(inserted.source_draft_id).toBe(SOURCE_DRAFT_ID);
      expect(JSON.stringify(inserted)).not.toContain(PLAYER_1_ID);
    });

    it("returns the existing link when the draft is already public", async () => {
      const { ctx, queries } = createMockContext({
        drafts: [finishedDraft()],
        shared_drafts: [ok({ slug: TEST_SHARE_SLUG })],
      });

      const result = await sharedDraftsRouter
        .createCaller(ctx)
        .publish({ draftId: SOURCE_DRAFT_ID, title: SHARE_TITLE });

      expect(result).toEqual({ slug: TEST_SHARE_SLUG });
      expect(queries.shared_drafts).toHaveLength(1);
    });

    it("returns the other player's link after a concurrent publish", async () => {
      const { ctx } = createMockContext({
        drafts: [finishedDraft()],
        shared_drafts: [
          ok(null),
          { data: null, error: { code: UNIQUE_VIOLATION_CODE } },
          ok({ slug: TEST_SHARE_SLUG }),
        ],
      });

      const result = await sharedDraftsRouter
        .createCaller(ctx)
        .publish({ draftId: SOURCE_DRAFT_ID, title: SHARE_TITLE });

      expect(result).toEqual({ slug: TEST_SHARE_SLUG });
    });

    it("fails on other insert errors", async () => {
      const { ctx } = createMockContext({
        drafts: [finishedDraft()],
        shared_drafts: [ok(null), { data: null, error: { code: "42501" } }],
      });

      await expect(
        sharedDraftsRouter
          .createCaller(ctx)
          .publish({ draftId: SOURCE_DRAFT_ID, title: SHARE_TITLE }),
      ).rejects.toThrow(FAILED_TO_PUBLISH);
    });

    it("rejects drafts that are not finished", async () => {
      const { ctx } = createMockContext({
        drafts: [finishedDraft({ draft_status: DRAFT_STATUS.DRAFT })],
      });

      await expect(
        sharedDraftsRouter
          .createCaller(ctx)
          .publish({ draftId: SOURCE_DRAFT_ID, title: SHARE_TITLE }),
      ).rejects.toThrow(DRAFT_NOT_FINISHED);
    });

    it("rejects users who did not play in the draft", async () => {
      const { ctx } = createMockContext({ drafts: [finishedDraft()] }, OUTSIDER_ID);

      await expect(
        sharedDraftsRouter
          .createCaller(ctx)
          .publish({ draftId: SOURCE_DRAFT_ID, title: SHARE_TITLE }),
      ).rejects.toThrow(NOT_A_DRAFT_PLAYER);
    });

    it("rejects drafts the user cannot read", async () => {
      const { ctx } = createMockContext({ drafts: [ok(null)] });

      await expect(
        sharedDraftsRouter
          .createCaller(ctx)
          .publish({ draftId: SOURCE_DRAFT_ID, title: SHARE_TITLE }),
      ).rejects.toThrow(DRAFT_NOT_FOUND);
    });

    it("rejects blank titles", async () => {
      const { ctx } = createMockContext({ drafts: [finishedDraft()] });

      await expect(
        sharedDraftsRouter
          .createCaller(ctx)
          .publish({ draftId: SOURCE_DRAFT_ID, title: "   " }),
      ).rejects.toThrow();
    });
  });

  describe("unpublish", () => {
    it("deletes the shared draft for the source draft", async () => {
      const { ctx, queries } = createMockContext({
        drafts: [finishedDraft()],
        shared_drafts: [ok(null)],
      });

      const result = await sharedDraftsRouter
        .createCaller(ctx)
        .unpublish({ draftId: SOURCE_DRAFT_ID });

      expect(result).toEqual({ success: true });
      expect(queries.shared_drafts[0].delete).toHaveBeenCalled();
      expect(queries.shared_drafts[0].eq).toHaveBeenCalledWith("source_draft_id", SOURCE_DRAFT_ID);
    });

    it("rejects users who did not play in the draft", async () => {
      const { ctx } = createMockContext({ drafts: [finishedDraft()] }, OUTSIDER_ID);

      await expect(
        sharedDraftsRouter.createCaller(ctx).unpublish({ draftId: SOURCE_DRAFT_ID }),
      ).rejects.toThrow(NOT_A_DRAFT_PLAYER);
    });
  });

  describe("getByDraftId", () => {
    it("returns the slug when the draft is public", async () => {
      const { ctx } = createMockContext({
        drafts: [finishedDraft()],
        shared_drafts: [ok({ slug: TEST_SHARE_SLUG })],
      });

      const result = await sharedDraftsRouter
        .createCaller(ctx)
        .getByDraftId({ draftId: SOURCE_DRAFT_ID });

      expect(result).toEqual({ slug: TEST_SHARE_SLUG });
    });

    it("returns null when the draft is private", async () => {
      const { ctx } = createMockContext({
        drafts: [finishedDraft()],
        shared_drafts: [ok(null)],
      });

      const result = await sharedDraftsRouter
        .createCaller(ctx)
        .getByDraftId({ draftId: SOURCE_DRAFT_ID });

      expect(result).toBeNull();
    });
  });
});
