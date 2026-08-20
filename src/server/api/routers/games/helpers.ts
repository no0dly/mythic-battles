import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Statistics } from "@/types/database.types";
import { updateStatsAfterGame } from "@/utils/users";
import { SOLO_PRACTICE_PLAYER_ID } from "@/types/constants";

type AdminClient = SupabaseClient<Database>;

/**
 * Apply win/loss statistics for both players.
 * Must run with a service-role client: RLS only allows a user to update their own row,
 * so the authenticated session client silently skips the opponent's update.
 */
export async function applyMatchStatistics(
  supabase: AdminClient,
  winnerId: string,
  loserId: string | null
) {
  await incrementUserStatistics(supabase, winnerId, true, "winner");

  if (loserId && loserId !== SOLO_PRACTICE_PLAYER_ID) {
    await incrementUserStatistics(supabase, loserId, false, "loser");
  }
}

async function incrementUserStatistics(
  supabase: AdminClient,
  userId: string,
  isWin: boolean,
  role: "winner" | "loser"
) {
  const { data, error } = await supabase
    .from("users")
    .select("statistics")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new TRPCError({
      code: error?.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch ${role} statistics`,
    });
  }

  const stats = (data as { statistics: Statistics }).statistics;
  const updatedStats = updateStatsAfterGame(stats, isWin);

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({ statistics: updatedStats as Json } as never)
    .eq("id", userId)
    .select("id")
    .single();

  if (updateError || !updated) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to update ${role} statistics`,
    });
  }
}
