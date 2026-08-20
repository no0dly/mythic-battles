import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { zShareSlug } from "../schemas";
import type { Card, SharedDraftRow } from "@/types/database.types";
import { collectSharedDraftCardIds } from "@/utils/shared-drafts/collectSharedDraftCardIds";
import { parseSharedDraftArmy } from "@/utils/shared-drafts/parseCardIds";
import type { SharedDraftWithCards } from "@/utils/shared-drafts/types";
import {
  FAILED_TO_FETCH_CARDS,
  SHARED_DRAFT_NOT_FOUND,
} from "./shared-drafts/constants";

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
        .select("*")
        .eq("slug", input.slug)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: SHARED_DRAFT_NOT_FOUND,
        });
      }

      const row = data as SharedDraftRow;
      const army = parseSharedDraftArmy(
        row.player1_card_ids,
        row.player2_card_ids,
      );
      const cardIds = collectSharedDraftCardIds(army);

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
        cards,
      };
    }),
});
