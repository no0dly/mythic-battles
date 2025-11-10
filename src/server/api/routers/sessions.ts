import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Session, Game } from "@/types/database.types";
import { zUuid } from "../schemas";
import { SESSION_STATUS, GAME_STATUS, DRAFT_STATUS } from "@/types/constants";
import {
  fetchPlayersMap,
  enrichSessionWithPlayers,
} from "./sessions/helpers";
import type { SessionWithPlayers } from "./sessions/types";


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
        userAllowedPoints: z.number().min(1),
        draftCount: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { opponentId, userAllowedPoints, draftCount } = input;

      // Track created records for rollback
      let createdSession: Session | null = null;
      let createdGame: Game | null = null;
      let createdDraft: { id: string } | null = null;

      try {
        // Verify opponent exists and is a friend (optional check)
        const { data: opponent, error: opponentError } = await ctx.supabase
          .from("users")
          .select("id")
          .eq("id", opponentId)
          .single();

        if (opponentError || !opponent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Opponent not found",
          });
        }

        const sessionInsert = {
          player1_id: userId,
          player2_id: opponentId,
          player1_session_score: 0,
          player2_session_score: 0,
          status: SESSION_STATUS.INVITE_TO_DRAFT,
          error_message: null,
          game_list: null,
        };
        const { data: session, error: sessionError } = await ctx.supabase
          .from("sessions")
          .insert(sessionInsert as never)
          .select()
          .single();

        if (sessionError || !session) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create session",
          });
        }

        createdSession = session as Session;

        const gameInsert = {
          session_id: createdSession.id,
          game_number: 1,
          status: GAME_STATUS.INVITE_TO_DRAFT,
          created_by: userId,
          winner_id: null,
          draft_id: null,
          finished_at: null,
        };
        const { data: game, error: gameError } = await ctx.supabase
          .from("games")
          .insert(gameInsert as never)
          .select()
          .single();

        if (gameError || !game) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create game",
          });
        }

        createdGame = game as Game;

        const draftInsert = {
          game_id: createdGame.id,
          player1_id: userId,
          player2_id: opponentId,
          draft_total_cost: draftCount,
          player_allowed_points: userAllowedPoints,
          initial_roll: null,
          first_turn_user_id: null,
          draft_status: DRAFT_STATUS.ROLL_FOR_TURN,
          draft_history: null,
          current_turn_user_id: opponentId,
        };
        const { data: draft, error: draftError } = await ctx.supabase
          .from("drafts")
          .insert(draftInsert as never)
          .select()
          .single();
        console.log("draft", draft);
        console.log("draftError", draftError);
        if (draftError || !draft) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create draft",
          });
        }

        createdDraft = { id: (draft as { id: string }).id };

        const { error: updateGameError } = await ctx.supabase
          .from("games")
          .update({ draft_id: (draft as { id: string }).id } as never)
          .eq("id", createdGame.id);

        if (updateGameError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update game with draft_id",
          });
        }

        // Update session with game_list
        const { error: updateSessionError } = await ctx.supabase
          .from("sessions")
          .update({ game_list: [createdGame.id] } as never)
          .eq("id", createdSession.id);

        if (updateSessionError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update session with game_list",
          });
        }

        return {
          session: createdSession,
          game: createdGame,
          draft: createdDraft,
        };
      } catch (error) {
        // Rollback: delete all created records in reverse order
        if (createdDraft) {
          await ctx.supabase.from("drafts").delete().eq("id", createdDraft.id);
        }
        if (createdGame) {
          await ctx.supabase.from("games").delete().eq("id", createdGame.id);
        }
        if (createdSession) {
          await ctx.supabase.from("sessions").delete().eq("id", createdSession.id);
        }

        // Re-throw the error
        throw error;
      }
    }),
});

