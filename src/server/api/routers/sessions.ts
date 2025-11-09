import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Session, Game, Draft } from "@/types/database.types";
import { zUuid } from "../schemas";
import { SESSION_STATUS, GAME_STATUS, DEFAULT_DRAFT_SETTINGS } from "@/types/constants";
import {
  fetchPlayersMap,
  enrichSessionWithPlayers,
} from "./sessions/helpers";
import type { SessionWithPlayers } from "./sessions/types";
import type { AppRouter } from "../root";


export const sessionsRouter = router({
  // Get all sessions with player names
  list: publicProcedure.query(async ({ ctx }) => {
    const { data: sessions, error } = await ctx.supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch sessions",
      });
    }

    if (!sessions || sessions.length === 0) {
      return [];
    }

    const sessionsList = sessions as Session[];

    // Collect all unique player IDs
    const playerIds = new Set<string>();
    sessionsList.forEach((session) => {
      playerIds.add(session.player1_id);
      playerIds.add(session.player2_id);
    });

    // Fetch player information
    const { nameMap, emailMap, avatarMap } = await fetchPlayersMap(
      ctx.supabase,
      Array.from(playerIds)
    );

    // Combine sessions with player information
    const sessionsWithPlayers: SessionWithPlayers[] = sessionsList.map((session) =>
      enrichSessionWithPlayers(session, nameMap, emailMap, avatarMap)
    );

    return sessionsWithPlayers;
  }),

  // Get session by ID with player names
  getById: publicProcedure
    .input(
      z.object({
        id: zUuid,
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: session, error } = await ctx.supabase
        .from("sessions")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error || !session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      // Type assertion needed because Supabase's type inference doesn't work well with Database generic
      const sessionData = session as Session;

      // Fetch player information
      const { nameMap, emailMap, avatarMap } = await fetchPlayersMap(
        ctx.supabase,
        [sessionData.player1_id, sessionData.player2_id]
      );

      // Enrich session with player information
      const sessionWithPlayers = enrichSessionWithPlayers(
        sessionData,
        nameMap,
        emailMap,
        avatarMap
      );

      return sessionWithPlayers;
    }),

  // Get sessions by list of IDs with player names
  getUserSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const { data: sessions, error } = await ctx.supabase
        .from("sessions")
        .select("*")
        .or(`player1_id.eq.${ctx.session.user.id},player2_id.eq.${ctx.session.user.id}`);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sessions",
        });
      }

      if (!sessions || sessions.length === 0) {
        return [];
      }

      const sessionsList = sessions as Session[];

      // Collect all unique player IDs
      const playerIds = new Set<string>();
      sessionsList.forEach((session) => {
        playerIds.add(session.player1_id);
        playerIds.add(session.player2_id);
      });

      // Fetch player information
      const { nameMap, emailMap, avatarMap } = await fetchPlayersMap(
        ctx.supabase,
        Array.from(playerIds)
      );

      // Combine sessions with player information
      const sessionsWithPlayers: SessionWithPlayers[] = sessionsList.map((session) =>
        enrichSessionWithPlayers(session, nameMap, emailMap, avatarMap)
      );

      return sessionsWithPlayers;
    }),

  // Create a new session with game and draft
  createWithDraft: protectedProcedure
    .input(
      z.object({
        opponentId: zUuid,
        user_allowed_points: z.number().min(1).default(DEFAULT_DRAFT_SETTINGS.user_allowed_points),
        draft_size: z.number().min(1).default(DEFAULT_DRAFT_SETTINGS.draft_size),
        gods_amount: z.number().min(1).default(DEFAULT_DRAFT_SETTINGS.gods_amount),
        titans_amount: z.number().min(1).default(DEFAULT_DRAFT_SETTINGS.titans_amount),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { opponentId, user_allowed_points, draft_size, gods_amount, titans_amount } = input;

      // Track created records for rollback
      let createdSession: Session | null = null;
      let createdGame: Game | null = null;

      try {
        // Verify opponent exists (parallel with session creation if needed, but keeping sequential for clarity)
        const { data: opponent, error: opponentError } = await ctx.supabase
          .from("users")
          .select("id")
          .eq("id", opponentId)
          .single();

        if (opponentError || !opponent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Opponent not found",
            cause: opponentError,
          });
        }

        // Create session
        const { data: session, error: sessionError } = await ctx.supabase
          .from("sessions")
          .insert({
            player1_id: userId,
            player2_id: opponentId,
            player1_session_score: 0,
            player2_session_score: 0,
            status: SESSION_STATUS.INVITE_TO_DRAFT,
            error_message: null,
            game_list: null,
          } as never)
          .select()
          .single();

        if (sessionError || !session) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create session",
            cause: sessionError,
          });
        }

        createdSession = session as Session;

        // Create game
        const { data: game, error: gameError } = await ctx.supabase
          .from("games")
          .insert({
            session_id: createdSession.id,
            game_number: 1,
            status: GAME_STATUS.INVITE_TO_DRAFT,
            created_by: userId,
            winner_id: null,
            draft_id: null,
            finished_at: null,
            draft_settings: {
              user_allowed_points,
              draft_size,
              gods_amount,
              titans_amount,
            },
          } as never)
          .select()
          .single();

        if (gameError || !game) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create game",
            cause: gameError,
          });
        }

        createdGame = game as Game;

        // Generate draft pool and create draft record in one call
        // Use dynamic import to avoid circular dependency
        const { appRouter } = await import("../root");
        const caller = appRouter.createCaller(ctx) as ReturnType<AppRouter["createCaller"]>;

        const draft: Draft = await caller.drafts.generateAndCreateDraft({
          game_id: createdGame.id,
          draft_size,
          gods_amount,
          titans_amount,
          player1_id: userId,
          player2_id: opponentId,
        });

        // Update session with game_list
        const { error: updateSessionError } = await ctx.supabase
          .from("sessions")
          .update({ game_list: [createdGame.id] } as never)
          .eq("id", createdSession.id);

        if (updateSessionError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update session with game_list",
            cause: updateSessionError,
          });
        }

        return {
          session: createdSession,
          game: createdGame,
          draft: { id: draft.id },
        };
      } catch (error) {
        if (createdGame) {
          // console.log("deleting game:", createdGame.id);
          // await ctx.supabase.from("games").delete().eq("id", createdGame.id);
          // TODO: figure out how to delete the game right now its not removing it
        }
        if (createdSession) {
          // console.log("deleting session:", createdSession.id);
          // await ctx.supabase.from("sessions").delete().eq("id", createdSession.id);
          // TODO: figure out how to delete the session right now its not removing it
        }

        throw error;
      }
    }),
});

