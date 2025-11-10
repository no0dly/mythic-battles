import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Game, Draft } from "@/types/database.types";
import { zUuid } from "../schemas";
import type { GameWithDraft, GameWithUserJoin } from "./games/types";
import { parseDraftHistory } from "@/utils/drafts";

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
          id: game.id,
          session_id: game.session_id,
          game_number: game.game_number,
          status: game.status,
          winner_id: game.winner_id,
          draft_id: game.draft_id,
          created_by: game.created_by,
          created_at: game.created_at,
          updated_at: game.updated_at,
          finished_at: game.finished_at,
          created_by_name: game.users?.display_name ?? null,
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
});

