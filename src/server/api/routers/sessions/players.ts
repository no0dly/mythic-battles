import { TRPCError } from "@trpc/server";
import type { GameMode, PlayerScores, PlayerTeams } from "@/types/database.types";
import {
  GAME_MODE,
  GAME_MODE_PLAYER_COUNT,
  PRACTICE_PLAYER_IDS,
  SOLO_PRACTICE_PLAYER_ID,
  TEAM,
  isPracticePlayerId,
} from "@/types/constants";

export interface SessionPlayersInput {
  mode: GameMode;
  creatorId: string;
  opponentIds: string[];
  teammateId?: string;
}

export interface ResolvedSessionPlayers {
  playerIds: string[];
  player1Id: string;
  player2Id: string;
  teams: PlayerTeams | null;
  isPractice: boolean;
}

/**
 * Validates players for a mode and returns them in session order (creator first).
 * Practice is all-or-nothing: every opponent is a practice player, and the
 * original practice opponent always fills player2 so 1v1 practice checks keep working.
 */
export function resolveSessionPlayers({
  mode,
  creatorId,
  opponentIds,
  teammateId,
}: SessionPlayersInput): ResolvedSessionPlayers {
  const opponentCount = GAME_MODE_PLAYER_COUNT[mode] - 1;
  const practiceCount = opponentIds.filter((id) => isPracticePlayerId(id)).length;
  const isPractice = practiceCount > 0 && practiceCount === opponentIds.length;

  const opponents = isPractice
    ? PRACTICE_PLAYER_IDS.slice(0, opponentCount)
    : [...new Set(opponentIds)];

  if (practiceCount > 0 && !isPractice) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Practice opponents cannot be mixed with friends",
    });
  }

  if (opponents.length !== opponentCount || opponents.includes(creatorId)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `This mode needs ${opponentCount} different opponents`,
    });
  }

  let teams: PlayerTeams | null = null;
  if (mode === GAME_MODE.TEAM_2V2) {
    const mate = isPractice ? opponents[opponents.length - 1] : teammateId;
    if (!mate || !opponents.includes(mate)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Pick a teammate from the selected players",
      });
    }
    teams = { [creatorId]: TEAM.FIRST };
    for (const id of opponents) {
      teams[id] = id === mate ? TEAM.FIRST : TEAM.SECOND;
    }
  }

  const playerIds = [creatorId, ...opponents];
  return {
    playerIds,
    player1Id: creatorId,
    player2Id: isPractice ? SOLO_PRACTICE_PLAYER_ID : opponents[0],
    teams,
    isPractice,
  };
}

export function initialPlayerScores(playerIds: string[]): PlayerScores {
  return Object.fromEntries(playerIds.map((id) => [id, 0]));
}
