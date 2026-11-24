import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure, type TRPCContext } from "../trpc";
import { zShareSlug, zShareTitle, zUuid } from "../schemas";
import type { Card, Draft, SharedDraftRow } from "@/types/database.types";
import { DRAFT_STATUS } from "@/types/constants";
import { isDraftParticipant } from "@/utils/drafts/turnOrder";
import { buildSharedDraftSnapshot } from "@/utils/shared-drafts/buildSharedDraftSnapshot";
import { collectArmiesCardIds } from "@/utils/shared-drafts/collectSharedDraftCardIds";
import { createShareSlug, createShareSlugSuffix } from "@/utils/shared-drafts/createShareSlug";
import {
  parseCardIds,
  parseSharedDraftArmies,
  parseSharedDraftArmy,
  parseSharedDraftPicks,
} from "@/utils/shared-drafts/parseCardIds";
import type { SharedDraftWithCards } from "@/utils/shared-drafts/types";
import {
  DRAFT_NOT_FINISHED,
  DRAFT_NOT_FOUND,
  FAILED_TO_FETCH_CARDS,
  FAILED_TO_FETCH_SHARE,
  FAILED_TO_PUBLISH,
  FAILED_TO_UNPUBLISH,
  NOT_A_DRAFT_PLAYER,
  SHARED_DRAFT_NOT_FOUND,
  UNIQUE_VIOLATION_CODE,
} from "./shared-drafts/constants";

const PUBLIC_COLUMNS =
  "id, slug, title, player1_card_ids, player2_card_ids, map_id, map_side, mode, armies, draft_history, draft_pool, created_at, updated_at";
const PUBLISH_ATTEMPTS = 2;

type AuthedContext = TRPCContext & { session: NonNullable<TRPCContext["session"]> };

const getPlayerDraft = async (ctx: AuthedContext, draftId: string): Promise<Draft> => {
  const { data, error } = await ctx.supabase
    .from("drafts")
    .select("*")
    .eq("id", draftId)
    .maybeSingle();

  if (error || !data) {
    throw new TRPCError({ code: "NOT_FOUND", message: DRAFT_NOT_FOUND });
  }

  const draft = data as Draft;
  if (!isDraftParticipant(draft, ctx.session.user.id)) {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_A_DRAFT_PLAYER });
  }

  return draft;
};

const findShareSlug = async (ctx: AuthedContext, draftId: string): Promise<string | null> => {
  const { data, error } = await ctx.supabase
    .from("shared_drafts")
    .select("slug")
    .eq("source_draft_id", draftId)
    .maybeSingle();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: FAILED_TO_FETCH_SHARE,
      cause: error,
    });
  }

  return (data as Pick<SharedDraftRow, "slug"> | null)?.slug ?? null;
};

export const sharedDraftsRouter = router({
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: zShareSlug,
      }),
    )
    .query(async ({ ctx, input }): Promise<SharedDraftWithCards> => {
      const { data, error } = await ctx.supabase
        .from("shared_drafts")
        .select(PUBLIC_COLUMNS)
        .eq("slug", input.slug)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: SHARED_DRAFT_NOT_FOUND,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { source_draft_id, draft_history, draft_pool, ...row } = data as SharedDraftRow;
      const army = parseSharedDraftArmy(
        row.player1_card_ids,
        row.player2_card_ids,
      );
      const armies = parseSharedDraftArmies(row.armies, army);
      const picks = parseSharedDraftPicks(draft_history);
      const pool = parseCardIds(draft_pool);
      const cardIds = [
        ...new Set([
          ...collectArmiesCardIds(armies),
          ...picks.map((pick) => pick.card_id),
          ...pool,
        ]),
      ];

      let cards: Card[] = [];
      if (cardIds.length > 0) {
        const { data: cardRows, error: cardsError } = await ctx.supabase
          .from("cards")
          .select("*")
          .in("id", cardIds);

        if (cardsError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: FAILED_TO_FETCH_CARDS,
            cause: cardsError,
          });
        }

        cards = (cardRows ?? []) as Card[];
      }

      return {
        ...row,
        player1_card_ids: army.player1_card_ids,
        player2_card_ids: army.player2_card_ids,
        armies,
        picks,
        draft_pool: pool,
        cards,
      };
    }),

  getByDraftId: protectedProcedure
    .input(z.object({ draftId: zUuid }))
    .query(async ({ ctx, input }) => {
      await getPlayerDraft(ctx, input.draftId);
      const slug = await findShareSlug(ctx, input.draftId);
      return slug ? { slug } : null;
    }),

  publish: protectedProcedure
    .input(z.object({ draftId: zUuid, title: zShareTitle }))
    .mutation(async ({ ctx, input }) => {
      const draft = await getPlayerDraft(ctx, input.draftId);

      if (draft.draft_status !== DRAFT_STATUS.FINISHED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: DRAFT_NOT_FINISHED });
      }

      const existingSlug = await findShareSlug(ctx, draft.id);
      if (existingSlug) {
        return { slug: existingSlug };
      }

      const snapshot = buildSharedDraftSnapshot(draft);

      for (let attempt = 0; attempt < PUBLISH_ATTEMPTS; attempt++) {
        const { data, error } = await ctx.supabase
          .from("shared_drafts")
          .insert({
            ...snapshot,
            title: input.title,
            slug: createShareSlug(input.title, createShareSlugSuffix()),
          } as never)
          .select("slug")
          .single();

        if (!error && data) {
          return { slug: (data as Pick<SharedDraftRow, "slug">).slug };
        }

        if (error?.code !== UNIQUE_VIOLATION_CODE) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: FAILED_TO_PUBLISH,
            cause: error,
          });
        }

        // Either another player published at the same moment, or the slug collided.
        const racedSlug = await findShareSlug(ctx, draft.id);
        if (racedSlug) {
          return { slug: racedSlug };
        }
      }

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: FAILED_TO_PUBLISH });
    }),

  unpublish: protectedProcedure
    .input(z.object({ draftId: zUuid }))
    .mutation(async ({ ctx, input }) => {
      await getPlayerDraft(ctx, input.draftId);

      const { error } = await ctx.supabase
        .from("shared_drafts")
        .delete()
        .eq("source_draft_id", input.draftId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: FAILED_TO_UNPUBLISH,
          cause: error,
        });
      }

      return { success: true };
    }),
});
