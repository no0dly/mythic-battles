import { TRPCError } from "@trpc/server";
import type { Session, Team } from "@/types/database.types";
import { GAME_MODE, GAME_STATUS, SESSION_STATUS } from "@/types/constants";
import { getDraftMode, getDraftPlayerIds } from "@/utils/drafts/turnOrder";
import type { TRPCContext } from "../../trpc";

interface FinishMultiplayerGameInput {
  gameId: string;
  sessionId: string;
  session: Session;
  isPractice: boolean;
  winnerId?: string;
  winnerTeam?: Team;
  winCondition?: string;
}

/**
 * Free-for-all: one winner. 2v2: both members of the winning team win.
 * Winners are validated before anything is written.
 */
export const resolveWinnerIds = (
  session: Session,
  winnerId?: string,
  winnerTeam?: Team
): string[] => {
  const playerIds = getDraftPlayerIds(session);

  if (getDraftMode(session) === GAME_MODE.TEAM_2V2) {
    const teams = session.player_teams ?? {};
    const winners = playerIds.filter((id) => teams[id] === winnerTeam);
    if (winnerTeam === undefined || winners.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Winning team is required",
      });
    }
    return winners;
  }

  if (!winnerId || !playerIds.includes(winnerId)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Winner is not part of this session",
    });
  }
  return [winnerId];
};

export async function finishMultiplayerGame(
  supabase: TRPCContext["supabase"],
  {
    gameId,
    sessionId,
    session,
    isPractice,
    winnerId,
    winnerTeam,
    winCondition,
  }: FinishMultiplayerGameInput
) {
  let winnerIds: string[] = [];
  if (!isPractice) {
    if (!winCondition) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Winner and win condition are required",
      });
    }
    winnerIds = resolveWinnerIds(session, winnerId, winnerTeam);
  }

  const { data: updatedGame, error: gameUpdateError } = await supabase
    .from("games")
    .update({
      status: GAME_STATUS.FINISHED,
      winner_id: winnerIds[0] ?? null,
      winner_ids: winnerIds.length > 0 ? winnerIds : null,
      finished_at: new Date().toISOString(),
      win_condition: isPractice ? null : winCondition,
    } as never)
    .eq("id", gameId)
    .eq("session_id", sessionId)
    .eq("status", GAME_STATUS.IN_PROGRESS)
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

  const scores = { ...(session.player_scores ?? {}) };
  for (const id of winnerIds) {
    scores[id] = (scores[id] ?? 0) + 1;
  }

  const { error: sessionUpdateError } = await supabase
    .from("sessions")
    .update({
      status: SESSION_STATUS.AVAILABLE,
      ...(winnerIds.length > 0 && { player_scores: scores }),
    } as never)
    .eq("id", sessionId);

  if (sessionUpdateError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update session status",
    });
  }

  return { success: true };
}
