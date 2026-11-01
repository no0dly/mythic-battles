import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { zUuid } from "../schemas";
import type { DraftResetRequest, Card, GameMap, DraftSettings, CardOrigin, Draft } from "@/types/database.types";
import { DRAFT_STATUS, DRAFT_RESET_REQUEST_STATUS, GAME_STATUS, CARD_TYPES, ALL_VALUE } from "@/types/constants";
import { SOLO_PRACTICE_PLAYER_ID } from "@/types/constants";
import {
  getDraftMode,
  getDraftPlayerIds,
  isDraftParticipant,
  isMultiplayerMode,
} from "@/utils/drafts/turnOrder";
import { getResetApproverIds, isMultiplayerResetRequest } from "@/utils/drafts/resetRequests";
import { createDraftSeating, multiplayerSeatingColumns } from "./drafts/seating";
import { withLegacyColumnFallback } from "../participants";
import {
  generateDraftPool,
  selectRandomMap,
  selectRandomMapSide,
} from "./drafts/index";
import { DraftPoolConfig } from "@/types/draft-settings.types";

export const draftResetRequestsRouter = router({
  // Get all pending reset requests where current user is the opponent (for notifications)
  getMyPendingAsOpponent: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const { data, error } = await withLegacyColumnFallback((legacy) =>
        ctx.supabase
          .from("draft_reset_requests")
          .select("*")
          .or(
            legacy
              ? `opponent_id.eq.${userId}`
              : `opponent_id.eq.${userId},required_approver_ids.cs.{${userId}}`
          )
          .eq("status", DRAFT_RESET_REQUEST_STATUS.PENDING)
          .order("created_at", { ascending: false })
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reset requests",
          cause: error,
        });
      }

      return ((data ?? []) as DraftResetRequest[]).filter(
        (request) => !request.approved_ids?.includes(userId)
      );
    }),

  // Get pending reset request for a draft
  getByDraftId: protectedProcedure
    .input(z.object({ draft_id: zUuid }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("draft_reset_requests")
        .select("*")
        .eq("draft_id", input.draft_id)
        .eq("status", DRAFT_RESET_REQUEST_STATUS.PENDING)
        .maybeSingle();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reset request",
          cause: error,
        });
      }

      return data as DraftResetRequest | null;
    }),

  // Request a draft reset
  requestReset: protectedProcedure
    .input(z.object({ draft_id: zUuid }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { data: draft, error: draftError } = await ctx.supabase
        .from("drafts")
        .select("*")
        .eq("id", input.draft_id)
        .single();

      if (draftError || !draft) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }

      const draftData = draft as Pick<Draft, "player1_id" | "player2_id" | "mode" | "player_ids"> & {
        draft_status: string;
        game_id: string;
      };

      if (!isDraftParticipant(draftData, userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a participant in this draft" });
      }

      if (draftData.draft_status !== DRAFT_STATUS.DRAFT) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Draft is not in draft status" });
      }

      if (draftData.player2_id === SOLO_PRACTICE_PLAYER_ID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset requests are not available in practice drafts",
        });
      }

      const { data: existing } = await ctx.supabase
        .from("draft_reset_requests")
        .select("id")
        .eq("draft_id", input.draft_id)
        .eq("status", DRAFT_RESET_REQUEST_STATUS.PENDING)
        .maybeSingle();

      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A reset request is already pending for this draft" });
      }

      const isMultiplayer = isMultiplayerMode(getDraftMode(draftData));
      const opponentId =
        draftData.player1_id === userId ? draftData.player2_id : draftData.player1_id;

      const { data: resetRequest, error: insertError } = await ctx.supabase
        .from("draft_reset_requests")
        .insert({
          draft_id: input.draft_id,
          game_id: draftData.game_id,
          requester_id: userId,
          status: DRAFT_RESET_REQUEST_STATUS.PENDING,
          ...(isMultiplayer
            ? {
                opponent_id: null,
                required_approver_ids: getDraftPlayerIds(draftData).filter((id) => id !== userId),
              }
            : { opponent_id: opponentId }),
        } as never)
        .select()
        .single();

      if (insertError || !resetRequest) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create reset request",
          cause: insertError,
        });
      }

      await Promise.all([
        ctx.supabase
          .from("drafts")
          .update({ draft_status: DRAFT_STATUS.RESET_REQUESTED } as never)
          .eq("id", input.draft_id),
        ctx.supabase
          .from("games")
          .update({ status: GAME_STATUS.DRAFT_RESET_REQUEST } as never)
          .eq("id", draftData.game_id),
      ]);

      return resetRequest as DraftResetRequest;
    }),

  // Accept a reset request (opponent only) — regenerates the draft
  acceptReset: protectedProcedure
    .input(z.object({ reset_request_id: zUuid }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { data: resetRequest, error: fetchError } = await ctx.supabase
        .from("draft_reset_requests")
        .select("*")
        .eq("id", input.reset_request_id)
        .single();

      if (fetchError || !resetRequest) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reset request not found" });
      }

      const request = resetRequest as DraftResetRequest;

      if (!getResetApproverIds(request).includes(userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the opponent can accept a reset request" });
      }

      if (request.status !== DRAFT_RESET_REQUEST_STATUS.PENDING) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Reset request is not pending" });
      }

      // Multiplayer: record this approval and wait for the remaining players
      if (isMultiplayerResetRequest(request)) {
        const approvedIds = [...new Set([...(request.approved_ids ?? []), userId])];
        const allApproved = getResetApproverIds(request).every((id) => approvedIds.includes(id));

        if (!allApproved) {
          await ctx.supabase
            .from("draft_reset_requests")
            .update({ approved_ids: approvedIds } as never)
            .eq("id", input.reset_request_id);
          return { success: true, waitingForOthers: true };
        }
      }

      // Fetch draft and game settings in parallel
      const [draftResult, gameResult] = await Promise.all([
        ctx.supabase
          .from("drafts")
          .select("*")
          .eq("id", request.draft_id)
          .single<Pick<Draft, "player1_id" | "player2_id" | "game_id" | "mode" | "player_ids" | "player_teams">>(),
        ctx.supabase
          .from("games")
          .select("draft_settings")
          .eq("id", request.game_id)
          .single<{ draft_settings: DraftSettings }>(),
      ]);

      if (draftResult.error || !draftResult.data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }
      if (gameResult.error || !gameResult.data?.draft_settings) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game or draft settings not found" });
      }

      const draftData = draftResult.data;
      const settings = gameResult.data.draft_settings;
      const origins = settings.origins as (CardOrigin | typeof ALL_VALUE)[];

      // Fetch all cards once, then derive art_of_war and companions in memory
      const { data: allCards, error: cardsError } = await ctx.supabase
        .from("cards")
        .select("*");

      if (cardsError || !allCards) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch cards" });
      }

      const cards = allCards as Card[];

      const config: DraftPoolConfig = {
        draft_size: settings.draft_size,
        gods_amount: settings.gods_amount,
        titans_amount: settings.titans_amount,
        troop_attachment_amount: settings.troop_attachment_amount,
        origins,
        maps: settings.maps,
      };

      const poolResult = generateDraftPool(cards, config);

      const artOfWarCardIds = cards
        .filter((c) => c.unit_type === CARD_TYPES.ART_OF_WAR)
        .map((c) => c.id);

      const allCardIds = [...poolResult.cardIds, ...artOfWarCardIds];

      // New initiative rolls
      const seating = createDraftSeating(
        getDraftPlayerIds(draftData),
        getDraftMode(draftData),
        draftData.player_teams
      );

      // Fetch maps and select new one
      const { data: allMaps } = await ctx.supabase.from("maps").select("*");
      const selectedMap = selectRandomMap((allMaps ?? []) as GameMap[], { origins, maps: settings.maps });
      const mapUpdate = selectedMap
        ? { map_id: selectedMap.id, map_side: selectRandomMapSide() }
        : {};

      // Apply all updates in parallel
      await Promise.all([
        ctx.supabase
          .from("draft_reset_requests")
          .update({
            status: DRAFT_RESET_REQUEST_STATUS.ACCEPTED,
            responded_at: new Date().toISOString(),
            ...(isMultiplayerResetRequest(request) && {
              approved_ids: getResetApproverIds(request),
            }),
          } as never)
          .eq("id", input.reset_request_id),
        ctx.supabase
          .from("drafts")
          .update({
            draft_pool: allCardIds,
            initial_roll: seating.initial_roll,
            draft_history: { picks: [] },
            draft_status: DRAFT_STATUS.DRAFT,
            current_turn_user_id: seating.current_turn_user_id,
            ...multiplayerSeatingColumns(seating),
            ...mapUpdate,
          } as never)
          .eq("id", request.draft_id),
        ctx.supabase
          .from("games")
          .update({ status: GAME_STATUS.DRAFT, ...mapUpdate } as never)
          .eq("id", request.game_id),
      ]);

      return { success: true };
    }),

  // Decline a reset request (any approver). One decline closes the request.
  declineReset: protectedProcedure
    .input(z.object({ reset_request_id: zUuid }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { data: resetRequest, error: fetchError } = await ctx.supabase
        .from("draft_reset_requests")
        .select("*")
        .eq("id", input.reset_request_id)
        .single();

      if (fetchError || !resetRequest) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reset request not found" });
      }

      const request = resetRequest as DraftResetRequest;

      if (!getResetApproverIds(request).includes(userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only an opponent can decline a reset request" });
      }

      if (request.status !== DRAFT_RESET_REQUEST_STATUS.PENDING) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Reset request is not pending" });
      }

      await Promise.all([
        ctx.supabase
          .from("draft_reset_requests")
          .update({
            status: DRAFT_RESET_REQUEST_STATUS.DECLINED,
            responded_at: new Date().toISOString(),
          } as never)
          .eq("id", input.reset_request_id),
        ctx.supabase
          .from("drafts")
          .update({ draft_status: DRAFT_STATUS.DRAFT } as never)
          .eq("id", request.draft_id),
        ctx.supabase
          .from("games")
          .update({ status: GAME_STATUS.DRAFT } as never)
          .eq("id", request.game_id),
      ]);

      return { success: true };
    }),

  // Cancel a reset request (requester only)
  cancelReset: protectedProcedure
    .input(z.object({ reset_request_id: zUuid }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { data: resetRequest, error: fetchError } = await ctx.supabase
        .from("draft_reset_requests")
        .select("*")
        .eq("id", input.reset_request_id)
        .single();

      if (fetchError || !resetRequest) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reset request not found" });
      }

      const request = resetRequest as DraftResetRequest;

      if (request.requester_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the requester can cancel a reset request" });
      }

      if (request.status !== DRAFT_RESET_REQUEST_STATUS.PENDING) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Reset request is not pending" });
      }

      // game_id is on the request itself — no extra DB call needed
      await Promise.all([
        ctx.supabase
          .from("draft_reset_requests")
          .update({
            status: DRAFT_RESET_REQUEST_STATUS.CANCELLED,
            responded_at: new Date().toISOString(),
          } as never)
          .eq("id", input.reset_request_id),
        ctx.supabase
          .from("drafts")
          .update({ draft_status: DRAFT_STATUS.DRAFT } as never)
          .eq("id", request.draft_id),
        ctx.supabase
          .from("games")
          .update({ status: GAME_STATUS.DRAFT } as never)
          .eq("id", request.game_id),
      ]);

      return { success: true };
    }),
});
