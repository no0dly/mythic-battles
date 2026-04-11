import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { zUuid } from "../schemas";
import type { DraftReadyCheck, Draft } from "@/types/database.types";
import {
  DRAFT_STATUS,
  DRAFT_RESET_REQUEST_STATUS,
  DRAFT_READY_CHECK_STATUS,
  GAME_STATUS,
  SESSION_STATUS,
} from "@/types/constants";

export const draftReadyChecksRouter = router({
  // Get pending ready check for a draft
  getByDraftId: protectedProcedure
    .input(z.object({ draft_id: zUuid }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("draft_ready_checks")
        .select("*")
        .eq("draft_id", input.draft_id)
        .eq("status", DRAFT_READY_CHECK_STATUS.PENDING)
        .maybeSingle();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ready check",
          cause: error,
        });
      }

      return data as DraftReadyCheck | null;
    }),

  // Mark current user as ready. If both players are ready, starts the game.
  markReady: protectedProcedure
    .input(z.object({ draft_id: zUuid }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { data: draft, error: draftError } = await ctx.supabase
        .from("drafts")
        .select("player1_id, player2_id, draft_status, game_id")
        .eq("id", input.draft_id)
        .single();

      if (draftError || !draft) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }

      const draftData = draft as {
        player1_id: string;
        player2_id: string;
        draft_status: string;
        game_id: string | null;
      };

      if (draftData.player1_id !== userId && draftData.player2_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant in this draft",
        });
      }

      if (draftData.draft_status !== DRAFT_STATUS.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Draft is not in draft status",
        });
      }

      if (!draftData.game_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Draft is not linked to a game",
        });
      }

      // Check for existing pending ready check
      const { data: existing, error: existingError } = await ctx.supabase
        .from("draft_ready_checks")
        .select("*")
        .eq("draft_id", input.draft_id)
        .eq("status", DRAFT_READY_CHECK_STATUS.PENDING)
        .maybeSingle();

      if (existingError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check ready state",
          cause: existingError,
        });
      }

      // First player to click ready — create the record
      if (!existing) {
        const { error: insertError } = await ctx.supabase
          .from("draft_ready_checks")
          .insert({
            draft_id: input.draft_id,
            game_id: draftData.game_id,
            first_player_id: userId,
            status: DRAFT_READY_CHECK_STATUS.PENDING,
          } as never);

        if (insertError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to mark as ready",
            cause: insertError,
          });
        }

        return { bothReady: false };
      }

      const existingCheck = existing as DraftReadyCheck;

      if (existingCheck.first_player_id === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already marked as ready",
        });
      }

      // Second player clicking ready — start the game

      // Expire any pending reset request
      await ctx.supabase
        .from("draft_reset_requests")
        .update({
          status: DRAFT_RESET_REQUEST_STATUS.EXPIRED,
          responded_at: new Date().toISOString(),
        } as never)
        .eq("draft_id", input.draft_id)
        .eq("status", DRAFT_RESET_REQUEST_STATUS.PENDING);

      // Finish the draft
      const { data: updatedDraft, error: draftUpdateError } = await ctx.supabase
        .from("drafts")
        .update({ draft_status: DRAFT_STATUS.FINISHED } as never)
        .eq("id", input.draft_id)
        .select()
        .single();

      if (draftUpdateError || !updatedDraft) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to finish draft",
          cause: draftUpdateError,
        });
      }

      // Start the game
      const { data: updatedGame, error: gameUpdateError } = await ctx.supabase
        .from("games")
        .update({ status: GAME_STATUS.IN_PROGRESS } as never)
        .eq("id", draftData.game_id)
        .select("id, session_id")
        .single();

      if (gameUpdateError || !updatedGame) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start game",
          cause: gameUpdateError,
        });
      }

      const gameData = updatedGame as { id: string; session_id: string | null };

      if (!gameData.session_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game is not linked to a session",
        });
      }

      // Update session status
      const { error: sessionUpdateError } = await ctx.supabase
        .from("sessions")
        .update({ status: SESSION_STATUS.IN_PROGRESS } as never)
        .eq("id", gameData.session_id)
        .select("id")
        .single();

      if (sessionUpdateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start session",
          cause: sessionUpdateError,
        });
      }

      // Delete the ready check record — game has started
      await ctx.supabase
        .from("draft_ready_checks")
        .delete()
        .eq("id", existingCheck.id);

      return { bothReady: true, draft: updatedDraft as Draft };
    }),

  // Cancel ready — only the first player can cancel while waiting for the second
  cancelReady: protectedProcedure
    .input(z.object({ draft_id: zUuid }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { data: existing, error: existingError } = await ctx.supabase
        .from("draft_ready_checks")
        .select("*")
        .eq("draft_id", input.draft_id)
        .eq("status", DRAFT_READY_CHECK_STATUS.PENDING)
        .maybeSingle();

      if (existingError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ready check",
          cause: existingError,
        });
      }

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending ready check found",
        });
      }

      const existingCheck = existing as DraftReadyCheck;

      if (existingCheck.first_player_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the player who clicked ready first can cancel",
        });
      }

      const { error: deleteError } = await ctx.supabase
        .from("draft_ready_checks")
        .delete()
        .eq("id", existingCheck.id);

      if (deleteError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel ready check",
          cause: deleteError,
        });
      }

      return { cancelled: true };
    }),
});
