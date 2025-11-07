import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Game } from "@/types/database.types";
import { zUuid } from "../schemas";

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
});

