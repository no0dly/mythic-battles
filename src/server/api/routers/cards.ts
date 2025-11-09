import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Card } from "@/types/database.types";
import { zUuid } from "../schemas";

export const cardsRouter = router({
  // Get all cards
  list: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("cards")
      .select("*")
      .order("unit_name", { ascending: true });

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch cards",
      });
    }

    return (data ?? []) as Card[];
  }),

  // Get card by ID
  getById: publicProcedure
    .input(
      z.object({
        id: zUuid,
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("cards")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Card not found",
        });
      }

      return data as Card;
    }),

  // Get multiple cards by IDs
  getByIds: publicProcedure
    .input(
      z.object({
        ids: z.array(zUuid).min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("cards")
        .select("*")
        .in("id", input.ids);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cards",
        });
      }

      return (data ?? []) as Card[];
    }),
});


