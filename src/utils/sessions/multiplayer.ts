import type { TFunction } from 'i18next'
import type { Game, GameMode } from '@/types/database.types'
import { TEAM } from '@/types/constants'
import type {
  SessionPlayerInfo,
  SessionWithPlayers,
} from '@/server/api/routers/sessions/types'
import { getDraftMode, isMultiplayerMode } from '@/utils/drafts/turnOrder'

const TEAM_NAME_SEPARATOR = ' & '
const SCORE_SEPARATOR = '-'

export const isMultiplayerSession = (session: { mode?: GameMode | null }): boolean =>
  isMultiplayerMode(getDraftMode(session))

export const getGameWinnerIds = (game: Pick<Game, 'winner_id' | 'winner_ids'>): string[] =>
  game.winner_ids && game.winner_ids.length > 0
    ? game.winner_ids
    : game.winner_id
      ? [game.winner_id]
      : []

/** 2v2 sessions return two sides; free-for-all returns one side per player. */
export const getSessionSides = (session: SessionWithPlayers): SessionPlayerInfo[][] => {
  const players = session.players ?? []
  const hasTeams = players.some((player) => player.team !== null)
  if (!hasTeams) return players.map((player) => [player])
  return [TEAM.FIRST, TEAM.SECOND].map((team) =>
    players.filter((player) => player.team === team)
  )
}

const joinNames = (players: SessionPlayerInfo[]) =>
  players.map((player) => player.name).join(TEAM_NAME_SEPARATOR)

export const getSessionTitle = (session: SessionWithPlayers, t: TFunction): string => {
  if (!isMultiplayerSession(session) || !session.players?.length) {
    return t('playedVSPlayer', {
      player1: session.player1_name,
      player2: session.player2_name,
    })
  }
  return getSessionSides(session)
    .map(joinNames)
    .join(` ${t('versusShort')} `)
}

/** Teammates share a score, so each side shows its best member's score. */
export const getSessionScoreText = (session: SessionWithPlayers): string => {
  if (!isMultiplayerSession(session) || !session.players?.length) {
    return `${session.player1_session_score}${SCORE_SEPARATOR}${session.player2_session_score}`
  }
  return getSessionSides(session)
    .map((side) => Math.max(0, ...side.map((player) => player.score)))
    .join(SCORE_SEPARATOR)
}

export const getPlayerNamesByIds = (session: SessionWithPlayers, ids: string[]): string => {
  const players = session.players ?? []
  return ids
    .map((id) => players.find((player) => player.id === id)?.name)
    .filter((name): name is string => !!name)
    .join(TEAM_NAME_SEPARATOR)
}
