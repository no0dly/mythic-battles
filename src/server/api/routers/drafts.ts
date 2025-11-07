import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Draft } from "@/types/database.types";
import { zUuid } from "../schemas";
import { DRAFT_STATUS } from "@/types/constants";

export const draftsRouter = router({
  // Get draft by ID
  getById: publicProcedure
    .input(
      z.object({
        id: zUuid,
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: draft, error } = await ctx.supabase
        .from("drafts")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error || !draft) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft not found",
        });
      }

      return draft as Draft;
    }),

  // Get drafts by array of IDs
  getByIds: publicProcedure
    .input(
      z.object({
        ids: z.array(zUuid).min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: drafts, error } = await ctx.supabase
        .from("drafts")
        .select("*")
        .in("id", input.ids);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch drafts",
        });
      }

      return (drafts ?? []) as Draft[];
    }),

  // Update draft
  update: protectedProcedure
    .input(
      z.object({
        id: zUuid,
        draft_total_cost: z.number().optional(),
        player_allowed_points: z.number().optional(),
        initial_roll: z.any().optional(),
        first_turn_user_id: zUuid.optional(),
        draft_status: z.enum(Object.values(DRAFT_STATUS)).optional(),
        draft_history: z.any().optional(),
        current_turn_user_id: zUuid.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify user has permission to update this draft
      const { data: draft, error: fetchError } = await ctx.supabase
        .from("drafts")
        .select("player1_id, player2_id")
        .eq("id", id)
        .single();

      if (fetchError || !draft) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft not found",
        });
      }

      const draftData = draft as { player1_id: string; player2_id: string };
      const userId = ctx.session.user.id;
      if (draftData.player1_id !== userId && draftData.player2_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this draft",
        });
      }

      const { data: updatedDraft, error: updateError } = await ctx.supabase
        .from("drafts")
        .update(updateData as never)
        .eq("id", id)
        .select()
        .single();

      if (updateError || !updatedDraft) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update draft",
        });
      }

      return updatedDraft as Draft;
    }),
});

