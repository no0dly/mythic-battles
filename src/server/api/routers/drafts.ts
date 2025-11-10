import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Draft, Card, DraftHistory } from "@/types/database.types";
import { zUuid } from "../schemas";
import { DRAFT_STATUS, DEFAULT_DRAFT_SETTINGS } from "@/types/constants";
import { generateDraftPool } from "./drafts/index";
import type { AppRouter } from "../root";
import { DraftPoolConfig } from "@/types/draft-settings.types";

export const draftsRouter = router({
  // Generate draft pool (returns pool without creating draft record)
  generatePool: protectedProcedure
    .input(
      z.object({
        draft_size: z
          .number()
          .int()
          .positive()
          .default(DEFAULT_DRAFT_SETTINGS.draft_size),
        gods_amount: z
          .number()
          .int()
          .nonnegative()
          .default(DEFAULT_DRAFT_SETTINGS.gods_amount),
        titans_amount: z
          .number()
          .int()
          .nonnegative()
          .default(DEFAULT_DRAFT_SETTINGS.titans_amount),
        player1_id: zUuid.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Fetch all cards from Supabase
      const { data: cards, error: cardsError } = await ctx.supabase
        .from("cards")
        .select("*");

      if (cardsError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cards from database",
          cause: cardsError,
        });
      }

      if (!cards || cards.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No cards found in database",
        });
      }

      const config: DraftPoolConfig = {
        draft_size: input.draft_size,
        gods_amount: input.gods_amount,
        titans_amount: input.titans_amount,
      };

      // Generate draft pool
      let poolResult;
      try {
        poolResult = generateDraftPool(cards as Card[], config);
        if (!poolResult || !poolResult.cardIds || poolResult.cardIds.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate draft pool",
          });
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to generate draft pool";

        // Check if it's a user input error (bad request) vs system error
        const isBadRequest = errorMessage.includes("Not enough units") ||
          errorMessage.includes("exceeded maximum iterations");

        throw new TRPCError({
          code: isBadRequest ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
          message: errorMessage,
          cause: error,
        });
      }

      return poolResult;
    }),

  // Create draft record in database
  createDraft: protectedProcedure
    .input(
      z.object({
        game_id: zUuid,
        draft_pool: z.array(z.string()),
        player1_id: zUuid,
        player2_id: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify game exists
      const { data: game, error: gameError } = await ctx.supabase
        .from("games")
        .select("id")
        .eq("id", input.game_id)
        .single();

      if (gameError || !game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      // Get current user ID for player1 if not provided
      const userId = ctx.session.user.id;
      const player1Id = input.player1_id || userId;
      const player2Id = input.player2_id || player1Id;

      // Generate random rolls for each player (1-100)
      const player1Roll = Math.floor(Math.random() * 100) + 1;
      const player2Roll = Math.floor(Math.random() * 100) + 1;

      // Create initial_roll array with both players' rolls
      const initialRoll = [
        { userID: player1Id, roll: player1Roll },
        { userID: player2Id, roll: player2Roll },
      ];

      // Determine who goes first based on highest roll
      // If tie, player1 goes first
      const firstTurnUserId =
        player2Roll > player1Roll ? player2Id : player1Id;

      // Create draft record with generated pool
      const draftInsert = {
        game_id: input.game_id,
        player1_id: player1Id,
        player2_id: player2Id,
        initial_roll: initialRoll,
        draft_status: DRAFT_STATUS.DRAFT,
        draft_pool: input.draft_pool,
        draft_history: [],
        current_turn_user_id: firstTurnUserId,
      };

      const { data: draft, error: draftError } = await ctx.supabase
        .from("drafts")
        .insert(draftInsert as never)
        .select()
        .single();

      if (draftError || !draft) {
        console.log("draftError:", draftError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create draft record",
          cause: draftError,
        });
      }

      const createdDraft = draft as Draft;

      // Update game with draft_id
      const { error: updateGameError } = await ctx.supabase
        .from("games")
        .update({ draft_id: createdDraft.id } as never)
        .eq("id", input.game_id);

      if (updateGameError) {
        // Rollback: delete the draft if game update fails
        await ctx.supabase.from("drafts").delete().eq("id", createdDraft.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update game with draft_id",
          cause: updateGameError,
        });
      }

      return createdDraft;
    }),

  // Generate pool and create draft in one call
  generateAndCreateDraft: protectedProcedure
    .input(
      z.object({
        game_id: zUuid,
        draft_size: z
          .number()
          .int()
          .positive()
          .default(DEFAULT_DRAFT_SETTINGS.draft_size),
        gods_amount: z
          .number()
          .int()
          .nonnegative()
          .default(DEFAULT_DRAFT_SETTINGS.gods_amount),
        titans_amount: z
          .number()
          .int()
          .nonnegative()
          .default(DEFAULT_DRAFT_SETTINGS.titans_amount),
        player1_id: zUuid.optional(),
        player2_id: zUuid.optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<Draft> => {
      // Use dynamic import to avoid circular dependency
      const { appRouter } = await import("../root");
      const caller = appRouter.createCaller(ctx) as ReturnType<AppRouter["createCaller"]>;

      // Step 1: Generate draft pool
      const poolResult = await caller.drafts.generatePool({
        draft_size: input.draft_size,
        gods_amount: input.gods_amount,
        titans_amount: input.titans_amount,
      });

      // Step 2: Create draft record with the generated pool
      const userId = ctx.session.user.id;
      const player1Id = input.player1_id || userId;
      const player2Id = input.player2_id || player1Id;

      const draft: Draft = await caller.drafts.createDraft({
        game_id: input.game_id,
        draft_pool: poolResult.cardIds,
        player1_id: player1Id,
        player2_id: player2Id,
      });

      return draft;
    }),

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

  // Pick a card in the draft
  pickCard: protectedProcedure
    .input(
      z.object({
        draft_id: zUuid,
        card_id: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify draft exists and user is a participant
      const { data: draft, error: draftError } = await ctx.supabase
        .from("drafts")
        .select("player1_id, player2_id, current_turn_user_id, draft_pool, draft_history, player_allowed_points")
        .eq("id", input.draft_id)
        .single();

      if (draftError || !draft) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft not found",
        });
      }

      const draftData = draft as {
        player1_id: string;
        player2_id: string;
        current_turn_user_id: string;
        draft_pool: string[];
        draft_history: unknown;
        player_allowed_points: number;
      };

      // Verify user is a participant
      if (draftData.player1_id !== userId && draftData.player2_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant in this draft",
        });
      }

      // Verify it's the user's turn
      if (draftData.current_turn_user_id !== userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "It's not your turn",
        });
      }

      // Verify card is in draft pool
      if (!draftData.draft_pool.includes(input.card_id)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Card is not available in the draft pool",
        });
      }

      // Get card to check cost
      const { data: card, error: cardError } = await ctx.supabase
        .from("cards")
        .select("cost")
        .eq("id", input.card_id)
        .single();

      if (cardError || !card) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Card not found",
        });
      }

      const cardData = card as { cost: number };

      // Parse draft history
      const { parseDraftHistory } = await import("@/utils/drafts/helpers");
      const draftHistory = parseDraftHistory(draftData.draft_history);
      const picks = draftHistory?.picks || [];

      // Calculate spent points for current user
      const userPicks = picks.filter((pick) => pick.player_id === userId);
      const userPickedCardIds = userPicks.map((pick) => pick.card_id);

      // Get costs of picked cards
      const { data: pickedCards, error: pickedCardsError } = await ctx.supabase
        .from("cards")
        .select("cost")
        .in("id", userPickedCardIds.length > 0 ? userPickedCardIds : ["00000000-0000-0000-0000-000000000000"]);

      if (pickedCardsError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch picked cards",
        });
      }

      const spentPoints = (pickedCards as { cost: number }[] || []).reduce((sum, c) => sum + c.cost, 0);
      const remainingPoints = draftData.player_allowed_points - spentPoints;

      // Verify user has enough points
      if (cardData.cost > remainingPoints) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough points to pick this card",
        });
      }

      // Check if card was already picked
      const alreadyPicked = picks.some((pick) => pick.card_id === input.card_id);
      if (alreadyPicked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Card has already been picked",
        });
      }

      // Get next pick number
      const nextPickNumber = picks.length + 1;

      // Add pick to draft history
      const newPick = {
        card_id: input.card_id,
        player_id: userId,
        pick_number: nextPickNumber,
        timestamp: new Date().toISOString(),
      };

      const updatedPicks = [...picks, newPick];
      const updatedHistory: DraftHistory = {
        picks: updatedPicks,
        ...(draftHistory?.initial_roll && { initial_roll: draftHistory.initial_roll }),
      };

      // Determine next turn (alternate between players)
      const nextTurnUserId =
        draftData.current_turn_user_id === draftData.player1_id
          ? draftData.player2_id
          : draftData.player1_id;

      // Update draft
      const { data: updatedDraft, error: updateError } = await ctx.supabase
        .from("drafts")
        .update({
          draft_history: updatedHistory,
          current_turn_user_id: nextTurnUserId,
        } as never)
        .eq("id", input.draft_id)
        .select()
        .single();

      if (updateError || !updatedDraft) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update draft",
          cause: updateError,
        });
      }

      return updatedDraft as Draft;
    }),

  // Finish draft (mark as finished)
  finishDraft: protectedProcedure
    .input(
      z.object({
        draft_id: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify draft exists and user is a participant
      const { data: draft, error: draftError } = await ctx.supabase
        .from("drafts")
        .select("player1_id, player2_id, draft_status")
        .eq("id", input.draft_id)
        .single();

      if (draftError || !draft) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft not found",
        });
      }

      const draftData = draft as {
        player1_id: string;
        player2_id: string;
        draft_status: string;
      };

      // Verify user is a participant
      if (draftData.player1_id !== userId && draftData.player2_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant in this draft",
        });
      }

      // Verify draft is in draft status
      if (draftData.draft_status !== DRAFT_STATUS.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Draft is not in draft status",
        });
      }

      // Update draft status to finished
      const { data: updatedDraft, error: updateError } = await ctx.supabase
        .from("drafts")
        .update({ draft_status: DRAFT_STATUS.FINISHED } as never)
        .eq("id", input.draft_id)
        .select()
        .single();

      if (updateError || !updatedDraft) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to finish draft",
          cause: updateError,
        });
      }

      return updatedDraft as Draft;
    }),

  // Request draft reset
  requestReset: protectedProcedure
    .input(
      z.object({
        draft_id: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify draft exists and user is a participant
      const { data: draft, error: draftError } = await ctx.supabase
        .from("drafts")
        .select("player1_id, player2_id, draft_status")
        .eq("id", input.draft_id)
        .single();

      if (draftError || !draft) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft not found",
        });
      }

      const draftData = draft as {
        player1_id: string;
        player2_id: string;
        draft_status: string;
      };

      // Verify user is a participant
      if (draftData.player1_id !== userId && draftData.player2_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant in this draft",
        });
      }

      // Verify draft is in draft status
      if (draftData.draft_status !== DRAFT_STATUS.DRAFT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Draft is not in draft status",
        });
      }

      // Update draft status to resetRequested
      const { data: updatedDraft, error: updateError } = await ctx.supabase
        .from("drafts")
        .update({ draft_status: DRAFT_STATUS.RESET_REQUESTED } as never)
        .eq("id", input.draft_id)
        .select()
        .single();

      if (updateError || !updatedDraft) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to request draft reset",
          cause: updateError,
        });
      }

      return updatedDraft as Draft;
    }),
});

