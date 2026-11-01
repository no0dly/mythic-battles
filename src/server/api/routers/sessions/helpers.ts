import { TRPCError } from "@trpc/server";
import type { Session } from "@/types/database.types";
import type { SessionWithPlayers, PlayerSubset } from "./types";
import { getDraftPlayerIds } from "@/utils/drafts/turnOrder";

export const collectSessionPlayerIds = (sessions: Session[]): string[] => [
  ...new Set(sessions.flatMap((session) => getDraftPlayerIds(session))),
];

type SupabaseClient = Awaited<
  ReturnType<typeof import("../../trpc").createTRPCContext>
>["supabase"];

/**
 * Fetch players from database and create maps for name, email, and avatar
 */
export async function fetchPlayersMap(
  supabase: SupabaseClient,
  playerIds: string[]
): Promise<{
  nameMap: Map<string, string>;
  emailMap: Map<string, string>;
  avatarMap: Map<string, string>;
}> {
  if (playerIds.length === 0) {
    return {
      nameMap: new Map(),
      emailMap: new Map(),
      avatarMap: new Map(),
    };
  }

  const { data: players, error: playersError } = await supabase
    .from("users")
    .select("id, display_name, email, avatar_url")
    .in("id", playerIds);

  if (playersError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch player information",
    });
  }

  const nameMap = new Map<string, string>();
  const emailMap = new Map<string, string>();
  const avatarMap = new Map<string, string>();

  (players as PlayerSubset[] | null)?.forEach((player) => {
    nameMap.set(player.id, player.display_name || player.email || "Unknown");
    emailMap.set(player.id, player.email);
    avatarMap.set(player.id, player.avatar_url);
  });

  return { nameMap, emailMap, avatarMap };
}

/**
 * Enrich a session with player information from maps
 */
export function enrichSessionWithPlayers(
  session: Session,
  nameMap: Map<string, string>,
  emailMap: Map<string, string>,
  avatarMap: Map<string, string>
): SessionWithPlayers {
  const legacyScores: Record<string, number> = {
    [session.player1_id]: session.player1_session_score ?? 0,
    [session.player2_id]: session.player2_session_score ?? 0,
  };
  const scores = session.player_scores ?? legacyScores;

  return {
    ...session,
    players: getDraftPlayerIds(session).map((id) => ({
      id,
      name: nameMap.get(id) || "Unknown",
      email: emailMap.get(id),
      avatar_url: avatarMap.get(id),
      team: session.player_teams?.[id] ?? null,
      score: scores[id] ?? 0,
    })),
    player1_name: nameMap.get(session.player1_id) || "Unknown",
    player2_name: nameMap.get(session.player2_id) || "Unknown",
    player1_email: emailMap.get(session.player1_id),
    player2_email: emailMap.get(session.player2_id),
    player1_avatar_url: avatarMap.get(session.player1_id),
    player2_avatar_url: avatarMap.get(session.player2_id),
  };
}


