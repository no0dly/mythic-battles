import { z } from "zod";
import type { TFunction } from "i18next";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import type { Team } from "@/types/database.types";
import { GAME_MODE, TEAM } from "@/types/constants";
import { getSessionSides, isMultiplayerSession } from "@/utils/sessions/multiplayer";
import { WIN_CONDITION_OPTIONS } from "./constants";

const TEAM_WINNER_PREFIX = "team:";
const TEAM_MEMBER_SEPARATOR = " & ";
const TEAMS: Team[] = [TEAM.FIRST, TEAM.SECOND];

const isWinConditionValue = (value: string) =>
  WIN_CONDITION_OPTIONS.some((option) => option.value === value);

export const createFinishGameFormSchema = (t: TFunction) =>
  z.object({
    playerId: z.string().min(1, t("selectPlayer")),
    winCondition: z
      .string()
      .min(1, t("selectOutcome"))
      .refine(isWinConditionValue, t("selectOutcome")),
  });

export const isTeamSession = (session: SessionWithPlayers) =>
  session.mode === GAME_MODE.TEAM_2V2 && !!session.players?.length;

/**
 * 1v1: both players. Free-for-all: every player. 2v2: one option per team,
 * encoded so the form keeps a single string field.
 */
export const mapSessionPlayersToOptions = (session: SessionWithPlayers, t?: TFunction) => {
  if (isTeamSession(session)) {
    return getSessionSides(session).map((side, index) => {
      const names = side.map((player) => player.name).join(TEAM_MEMBER_SEPARATOR);
      const teamLabel = t ? t("draftTeamLabel", { number: TEAMS[index] }) : `${TEAMS[index]}`;
      return { id: `${TEAM_WINNER_PREFIX}${TEAMS[index]}`, name: `${teamLabel}: ${names}` };
    });
  }
  if (isMultiplayerSession(session) && session.players?.length) {
    return session.players.map((player) => ({ id: player.id, name: player.name }));
  }
  return [
    { id: session.player1_id, name: session.player1_name },
    { id: session.player2_id, name: session.player2_name },
  ];
};

export const parseWinnerSelection = (
  value: string
): { winnerId?: string; winnerTeam?: Team } =>
  value.startsWith(TEAM_WINNER_PREFIX)
    ? { winnerTeam: Number(value.slice(TEAM_WINNER_PREFIX.length)) as Team }
    : { winnerId: value };

export const getCurrentGameId = (session: SessionWithPlayers) =>
  session.game_list?.[session.game_list.length - 1];
