import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Game, Draft, Session, Statistics, Json } from "@/types/database.types";
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

        // Merge initial_roll from draft object into parsed_draft_history if not already present
        if (
          draft &&
          parsedDraftHistory &&
          !parsedDraftHistory.initial_roll &&
          draft.initial_roll &&
          Array.isArray(draft.initial_roll)
        ) {
          const initialRoll = draft.initial_roll as Array<{
            userID: string;
            roll: number;
          }>;
          const player1Roll = initialRoll.find((r) => r.userID === draft.player1_id)?.roll;
          const player2Roll = initialRoll.find((r) => r.userID === draft.player2_id)?.roll;

          if (player1Roll !== undefined && player2Roll !== undefined) {
            parsedDraftHistory.initial_roll = {
              player1_roll: player1Roll,
              player2_roll: player2Roll,
            };
          }
        }

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

      // Merge initial_roll from draft object into parsed_draft_history if not already present
      if (
        draft &&
        parsedDraftHistory &&
        !parsedDraftHistory.initial_roll &&
        draft.initial_roll &&
        Array.isArray(draft.initial_roll)
      ) {
        const initialRoll = draft.initial_roll as Array<{
          userID: string;
          roll: number;
        }>;
        const player1Roll = initialRoll.find((r) => r.userID === draft.player1_id)?.roll;
        const player2Roll = initialRoll.find((r) => r.userID === draft.player2_id)?.roll;

        if (player1Roll !== undefined && player2Roll !== undefined) {
          parsedDraftHistory.initial_roll = {
            player1_roll: player1Roll,
            player2_roll: player2Roll,
          };
        }
      }

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
        winCondition: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { gameId, sessionId, winnerId, winCondition } = input;

      const { data: updatedGame, error: gameUpdateError } = await ctx.supabase
        .from("games")
        .update({
          status: GAME_STATUS.FINISHED,
          winner_id: winnerId ?? null,
          finished_at: new Date().toISOString(),
          win_condition: winCondition,
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

      // Increment session score for the winner
      const { data: session, error: sessionFetchError } = await ctx.supabase
        .from("sessions")
        .select(
          "player1_id, player2_id, player1_session_score, player2_session_score",
        )
        .eq("id", sessionId)
        .single();

      if (sessionFetchError || !session) {
        throw new TRPCError({
          code:
            sessionFetchError?.code === "PGRST116"
              ? "NOT_FOUND"
              : "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch session for score update",
        });
      }

      const sessionData = session as Session;
      const isWinnerPlayer1 = sessionData.player1_id === winnerId;
      const isWinnerPlayer2 = sessionData.player2_id === winnerId;

      if (!isWinnerPlayer1 && !isWinnerPlayer2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Winner is not part of this session",
        });
      }

      const { error: scoreUpdateError } = await ctx.supabase
        .from("sessions")
        .update({
          player1_session_score:
            sessionData.player1_session_score + (isWinnerPlayer1 ? 1 : 0),
          player2_session_score:
            sessionData.player2_session_score + (isWinnerPlayer2 ? 1 : 0),
        } as never)
        .eq("id", sessionId);

      if (scoreUpdateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update session score",
        });
      }

      // Update user statistics (winner win, loser loss)
      const loserId = isWinnerPlayer1 ? sessionData.player2_id : sessionData.player1_id;

      const { data: winnerData, error: winnerFetchError } = await ctx.supabase
        .from("users")
        .select("statistics")
        .eq("id", winnerId)
        .single();

      if (winnerFetchError || !winnerData) {
        throw new TRPCError({
          code:
            winnerFetchError?.code === "PGRST116"
              ? "NOT_FOUND"
              : "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch winner statistics",
        });
      }

      // @ts-expect-error - Supabase SSR client typing issue with Database generic
      const winnerStats = winnerData.statistics as Statistics;
      const winnerNewWins = winnerStats.wins + 1;
      const winnerTotalGames = winnerStats.total_games + 1;
      const winnerWinRate = (winnerNewWins / winnerTotalGames) * 100;

      const updatedWinnerStats: Statistics = {
        ...winnerStats,
        wins: winnerNewWins,
        total_games: winnerTotalGames,
        win_rate: Number(winnerWinRate.toFixed(2)),
        longest_win_streak: Math.max(winnerStats.longest_win_streak, winnerNewWins),
      };

      const { error: winnerUpdateError } = await ctx.supabase
        .from("users")
        .update({ statistics: updatedWinnerStats as Json } as never)
        .eq("id", winnerId);

      if (winnerUpdateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update winner statistics",
        });
      }

      const { data: loserData, error: loserFetchError } = await ctx.supabase
        .from("users")
        .select("statistics")
        .eq("id", loserId)
        .single();

      if (loserFetchError || !loserData) {
        throw new TRPCError({
          code:
            loserFetchError?.code === "PGRST116"
              ? "NOT_FOUND"
              : "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch loser statistics",
        });
      }

      // @ts-expect-error - Supabase SSR client typing issue with Database generic
      const loserStats = loserData.statistics as Statistics;
      const loserNewLosses = loserStats.losses + 1;
      const loserTotalGames = loserStats.total_games + 1;
      const loserWinRate = (loserStats.wins / loserTotalGames) * 100;

      const updatedLoserStats: Statistics = {
        ...loserStats,
        losses: loserNewLosses,
        total_games: loserTotalGames,
        win_rate: Number(loserWinRate.toFixed(2)),
        longest_loss_streak: Math.max(loserStats.longest_loss_streak, loserNewLosses),
      };

      const { error: loserUpdateError } = await ctx.supabase
        .from("users")
        .update({ statistics: updatedLoserStats as Json } as never)
        .eq("id", loserId);

      if (loserUpdateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update loser statistics",
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
        troop_attachment_amount: z.number().min(1).default(4),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { sessionId, user_allowed_points, draft_size, gods_amount, titans_amount, troop_attachment_amount } = input;

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
              troop_attachment_amount,
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
          troop_attachment_amount,
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

