import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import type { Session } from "@/types/database.types";
import { zUuid } from "../schemas";
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
  getByIds: publicProcedure
    .input(
      z.object({
        ids: z.array(zUuid).min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: sessions, error } = await ctx.supabase
        .from("sessions")
        .select("*")
        .in("id", input.ids);

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
});

