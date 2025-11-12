import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { UserProfile, Statistics, Json, UserSubset } from "@/types/database.types";
import { zUuid } from "../schemas";

// Type for user subset returned by getUsersByIds


export const usersRouter = router({
  // Get current user profile
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const { data, error } = await ctx.supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    return data as UserProfile;
  }),

  // Get user by ID (public, for viewing profiles)
  getUserById: publicProcedure
    .input(
      z.object({
        userId: zUuid,
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("users")
        .select("id, email, display_name, avatar_url, statistics, created_at")
        .eq("id", input.userId)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return data;
    }),

  // Get multiple users by IDs
  getUsersByIds: publicProcedure
    .input(
      z.object({
        userIds: z.array(zUuid).min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("users")
        .select("id, email, display_name, avatar_url")
        .in("id", input.userIds);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users",
        });
      }

      return (data ?? []) as UserSubset[];
    }),

  // Search users by email or display name
  searchUsers: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("users")
        .select("id, email, display_name, avatar_url")
        .or(`email.ilike.%${input.query}%,display_name.ilike.%${input.query}%`)
        .limit(input.limit);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search users",
        });
      }

      type UserSubset = Pick<UserProfile, 'id' | 'email' | 'display_name' | 'avatar_url'>;
      return (data ?? []) as UserSubset[];
    }),

  // Update current user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        display_name: z.string().min(1).max(50).optional(),
        avatar_url: z.string().url().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const updateData: Partial<UserProfile> = {};
      if (input.display_name !== undefined) {
        updateData.display_name = input.display_name;
      }
      if (input.avatar_url !== undefined) {
        updateData.avatar_url = input.avatar_url;
      }

      const { data, error } = await ctx.supabase
        .from("users")
        // @ts-expect-error - Supabase SSR client typing issue with Database generic
        .update(updateData)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }

      return data as UserProfile;
    }),

  // Update user statistics
  updateStatistics: protectedProcedure
    .input(
      z.object({
        wins: z.number().int().nonnegative().optional(),
        losses: z.number().int().nonnegative().optional(),
        total_games: z.number().int().nonnegative().optional(),
        win_rate: z.number().min(0).max(100).optional(),
        longest_win_streak: z.number().int().nonnegative().optional(),
        longest_loss_streak: z.number().int().nonnegative().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get current statistics
      const { data: currentData, error: fetchError } = await ctx.supabase
        .from("users")
        .select("statistics")
        .eq("id", userId)
        .single();

      if (fetchError || !currentData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // @ts-expect-error - Supabase SSR client typing issue with Database generic
      const currentStats = currentData.statistics as Statistics;
      const updatedStats: Statistics = {
        ...currentStats,
        ...input,
      };

      const { data, error } = await ctx.supabase
        .from("users")
        // @ts-expect-error - Supabase SSR client typing issue with Database generic
        .update({ statistics: updatedStats as Json })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update statistics",
        });
      }

      return data as UserProfile;
    }),

  // Increment win
  incrementWin: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const { data: currentData, error: fetchError } = await ctx.supabase
      .from("users")
      .select("statistics")
      .eq("id", userId)
      .single();

    if (fetchError || !currentData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // @ts-expect-error - Supabase SSR client typing issue with Database generic
    const stats = currentData.statistics as Statistics;
    const newWins = stats.wins + 1;
    const newTotalGames = stats.total_games + 1;
    const newWinRate = (newWins / newTotalGames) * 100;

    const updatedStats: Statistics = {
      ...stats,
      wins: newWins,
      total_games: newTotalGames,
      win_rate: Number(newWinRate.toFixed(2)),
      longest_win_streak: Math.max(stats.longest_win_streak, newWins),
    };

    const { data, error } = await ctx.supabase
      .from("users")
      // @ts-expect-error - Supabase SSR client typing issue with Database generic
      .update({ statistics: updatedStats as Json })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to increment win",
      });
    }

    return data as UserProfile;
  }),

  // Increment loss
  incrementLoss: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const { data: currentData, error: fetchError } = await ctx.supabase
      .from("users")
      .select("statistics")
      .eq("id", userId)
      .single();

    if (fetchError || !currentData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // @ts-expect-error - Supabase SSR client typing issue with Database generic
    const stats = currentData.statistics as Statistics;
    const newLosses = stats.losses + 1;
    const newTotalGames = stats.total_games + 1;
    const newWinRate = (stats.wins / newTotalGames) * 100;

    const updatedStats: Statistics = {
      ...stats,
      losses: newLosses,
      total_games: newTotalGames,
      win_rate: Number(newWinRate.toFixed(2)),
      longest_loss_streak: Math.max(stats.longest_loss_streak, newLosses),
    };

    const { data, error } = await ctx.supabase
      .from("users")
      // @ts-expect-error - Supabase SSR client typing issue with Database generic
      .update({ statistics: updatedStats as Json })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to increment loss",
      });
    }

    return data as UserProfile;
  }),

  // Get leaderboard (top users by win rate)
  getLeaderboard: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        minGames: z.number().min(0).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("users")
        .select("id, display_name, avatar_url, statistics")
        .gte("statistics->total_games", input.minGames)
        .order("statistics->win_rate", { ascending: false })
        .limit(input.limit);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch leaderboard",
        });
      }

      type LeaderboardUser = Pick<UserProfile, 'id' | 'display_name' | 'avatar_url' | 'statistics'>;
      return (data ?? []) as LeaderboardUser[];
    }),
});

