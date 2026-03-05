import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { GameMap } from "@/types/database.types";

export const mapsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("maps")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch maps",
      });
    }

    return (data ?? []) as GameMap[];
  }),
});
