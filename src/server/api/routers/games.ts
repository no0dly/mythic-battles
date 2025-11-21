import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Game, Draft, Session } from "@/types/database.types";
import { zUuid } from "../schemas";
import type { GameWithDraft, GameWithUserJoin } from "./games/types";
import { parseDraftHistory } from "@/utils/drafts";
import { GAME_STATUS, SESSION_STATUS } from "@/types/constants";
import type { AppRouter } from "../root";

export const gamesRouter = router({
  // Get games by array of IDs
  getByIds: publicProcedure
    .input(
      z.object({
        ids: z.array(zUuid).min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: games, error } = await ctx.supabase
        .from("games")
        .select("*")
        .in("id", input.ids)
        .order("game_number", { ascending: true });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch games",
        });
      }

      return (games ?? []) as Game[];
    }),
  // Get list of games by array of IDs, returns details for each
  getList: publicProcedure
    .input(
      z.object({
        ids: z.array(zUuid).min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: games, error } = await ctx.supabase
        .from("games")
        .select("*")
        .in("id", input.ids)
        .order("game_number", { ascending: true });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch games",
        });
      }

      return (games ?? []) as Game[];
    }),

  // Get all games for a session with draft details
  getBySessionId: protectedProcedure
    .input(z.object({ sessionId: zUuid }))
    .query(async ({ ctx, input }) => {
      const { data: gamesData, error: gamesError } = await ctx.supabase
        .from("games")
        .select(`
          *,
          users!games_created_by_fkey (
            display_name
          )
        `)
        .eq("session_id", input.sessionId)
        .order("game_number", { ascending: true });

      if (gamesError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch games",
        });
      }

      if (!gamesData || gamesData.length === 0) {
        return [];
      }

      const draftIds = (gamesData as GameWithUserJoin[])
        .map((g) => g.draft_id)
        .filter((id): id is string => id !== null);

      let draftsMap: Record<string, Draft> = {};
      if (draftIds.length > 0) {
        const { data: draftsData, error: draftsError } = await ctx.supabase
          .from("drafts")
          .select("*")
          .in("id", draftIds);

        if (draftsError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch drafts",
          });
        }

        draftsMap = ((draftsData ?? []) as Draft[]).reduce<Record<string, Draft>>((acc, draft) => {
          acc[draft.id] = draft as Draft;
          return acc;
        }, {});
      }

      const games: GameWithDraft[] = (gamesData as GameWithUserJoin[]).map((game) => {
        const draft = game.draft_id ? draftsMap[game.draft_id] : null;

        const parsedDraftHistory = draft?.draft_history
          ? parseDraftHistory(draft.draft_history)
          : null;

        return {
          ...game,
          draft: draft ? {
            ...draft,
            parsed_draft_history: parsedDraftHistory,
          } : null,
        };
      });

      return games;
    }),

  // Get details of a single game
  getGameDetails: publicProcedure
    .input(z.object({ gameId: zUuid }))
    .query(async ({ ctx, input }) => {
      const { data: gameData, error: gameError } = await ctx.supabase
        .from("games")
        .select("*")
        .eq("id", input.gameId)
        .single();

      if (gameError) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      const game = gameData as Game;

      let draft: Draft | null = null;
      if (game.draft_id) {
        const { data: draftData, error: draftError } = await ctx.supabase
          .from("drafts")
          .select("*")
          .eq("id", game.draft_id)
          .single();

        if (!draftError && draftData) {
          draft = draftData as Draft;
        }
      }

      const parsedDraftHistory = draft?.draft_history
        ? parseDraftHistory(draft.draft_history)
        : null;

      const gameWithDraft: GameWithDraft = {
        ...game,
        draft: draft ? {
          ...draft,
          parsed_draft_history: parsedDraftHistory,
        } : null,
      };

      return gameWithDraft;
    }),

  // Get game settings by game ID
  getGameSettings: publicProcedure
    .input(z.object({ game_id: zUuid }))
    .query(async ({ ctx, input }) => {
      const { data: gameData, error: gameError } = await ctx.supabase
        .from("games")
        .select("draft_settings")
        .eq("id", input.game_id)
        .single();

      if (gameError || !gameData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      const game = gameData as Pick<Game, "draft_settings">;
      return game.draft_settings;
    }),
  finishGame: protectedProcedure
    .input(
      z.object({
        gameId: zUuid,
        sessionId: zUuid,
        winnerId: zUuid,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { gameId, sessionId, winnerId } = input;

      const { data: updatedGame, error: gameUpdateError } = await ctx.supabase
        .from("games")
        .update({
          status: GAME_STATUS.FINISHED,
          winner_id: winnerId ?? null,
          finished_at: new Date().toISOString(),
        } as never)
        .eq("id", gameId)
        .eq("session_id", sessionId)
        .select("id")
        .single();

      if (gameUpdateError || !updatedGame) {
        throw new TRPCError({
          code:
            gameUpdateError?.code === "PGRST116"
              ? "NOT_FOUND"
              : "INTERNAL_SERVER_ERROR",
          message: "Failed to finish game",
        });
      }

      const { error: sessionUpdateError } = await ctx.supabase
        .from("sessions")
        .update({
          status: SESSION_STATUS.AVAILABLE,
        } as never)
        .eq("id", sessionId);

      if (sessionUpdateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update session status",
        });
      }

      return { success: true };
    }),

  // Create a new game with draft for an existing session
  createGameWithDraft: protectedProcedure
    .input(
      z.object({
        sessionId: zUuid,
        user_allowed_points: z.number().min(1).default(18),
        draft_size: z.number().min(1).default(40),
        gods_amount: z.number().min(1).default(4),
        titans_amount: z.number().min(1).default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { sessionId, user_allowed_points, draft_size, gods_amount, titans_amount } = input;

      // Track created records for cleanup on error
      let createdGame: Game | null = null;
      let createdDraft: Draft | null = null;

      try {
        // Get the existing session and verify authorization in one query
        const { data: session, error: sessionError } = await ctx.supabase
          .from("sessions")
          .select("*")
          .eq("id", sessionId)
          .single();

        if (sessionError || !session) {
          throw new TRPCError({
            code: sessionError?.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
            message: "Session not found",
            cause: sessionError,
          });
        }

        const sessionData = session as Session;

        // Verify user is part of the session
        if (sessionData.player1_id !== userId && sessionData.player2_id !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to create a game for this session",
          });
        }

        // Calculate next game number using MAX aggregation (more efficient than fetching all games)
        const { data: maxGameData, error: maxGameError } = await ctx.supabase
          .from("games")
          .select("game_number")
          .eq("session_id", sessionId)
          .order("game_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (maxGameError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch existing games",
            cause: maxGameError,
          });
        }

        const maxGame = maxGameData as { game_number: number } | null;
        const nextGameNumber = maxGame?.game_number ? maxGame.game_number + 1 : 1;

        // Create game
        const { data: game, error: gameError } = await ctx.supabase
          .from("games")
          .insert({
            session_id: sessionId,
            game_number: nextGameNumber,
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

        // Generate draft pool and create draft record
        const { appRouter } = await import("../root");
        const caller = appRouter.createCaller(ctx) as ReturnType<AppRouter["createCaller"]>;

        const draft: Draft = await caller.drafts.generateAndCreateDraft({
          game_id: createdGame.id,
          draft_size,
          gods_amount,
          titans_amount,
          player1_id: sessionData.player1_id,
          player2_id: sessionData.player2_id,
        });

        createdDraft = draft;

        // Update session with game_list (append new game) and status
        // Use the game_list from the initial fetch to avoid race conditions
        const currentGameList = (sessionData.game_list as string[] | null) || [];
        const updatedGameList = [...currentGameList, createdGame.id];

        const { data: updatedSession, error: updateSessionError } = await ctx.supabase
          .from("sessions")
          .update({
            game_list: updatedGameList,
            status: SESSION_STATUS.INVITE_TO_DRAFT,
          } as never)
          .eq("id", sessionId)
          .select()
          .single();

        if (updateSessionError || !updatedSession) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update session with game_list",
            cause: updateSessionError,
          });
        }

        return {
          session: updatedSession as Session,
          game: createdGame,
          draft: { id: draft.id },
        };
      } catch (error) {
        // Cleanup: Delete created draft and game if creation failed
        // Attempt cleanup but don't let cleanup errors mask the original error
        try {
          if (createdDraft) {
            await ctx.supabase.from("drafts").delete().eq("id", createdDraft.id);
          }
          if (createdGame) {
            await ctx.supabase.from("games").delete().eq("id", createdGame.id);
          }
        } catch (cleanupError) {
          // Log cleanup errors but don't throw - the original error is more important
          console.error("Failed to cleanup created records:", cleanupError);
        }

        throw error;
      }
    }),
});

