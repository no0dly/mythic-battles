import { describe, expect, it } from 'vitest'
import type { TFunction } from 'i18next'
import type { SessionWithPlayers } from '@/server/api/routers/sessions/types'
import { GAME_MODE, TEAM } from '@/types/constants'
import {
  getGameWinnerIds,
  getPlayerNamesByIds,
  getSessionScoreText,
  getSessionTitle,
} from '../multiplayer'
import {
  mapSessionPlayersToOptions,
  parseWinnerSelection,
} from '@/app/components/SessionDrawerButtons/components/SessionDrawerButtonsInProgress/utils'
import { getDraftSeats } from '@/utils/drafts/seats'

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as unknown as TFunction

const baseSession = {
  id: 's1',
  player1_id: 'a',
  player2_id: 'b',
  player1_name: 'Ann',
  player2_name: 'Bob',
  player1_session_score: 2,
  player2_session_score: 1,
} as SessionWithPlayers

const player = (id: string, name: string, team: 1 | 2 | null, score: number) => ({
  id,
  name,
  team,
  score,
})

describe('session multiplayer helpers', () => {
  it('keeps the 1v1 title and score unchanged', () => {
    expect(getSessionTitle(baseSession, t)).toBe(
      'playedVSPlayer:{"player1":"Ann","player2":"Bob"}'
    )
    expect(getSessionScoreText(baseSession)).toBe('2-1')
  })

  it('lists every free-for-all player with their own score', () => {
    const session = {
      ...baseSession,
      mode: GAME_MODE.FFA3,
      players: [player('a', 'Ann', null, 3), player('b', 'Bob', null, 1), player('c', 'Cy', null, 0)],
    } as SessionWithPlayers

    expect(getSessionTitle(session, t)).toBe('Ann versusShort Bob versusShort Cy')
    expect(getSessionScoreText(session)).toBe('3-1-0')
  })

  it('groups 2v2 players by team and shows one score per team', () => {
    const session = {
      ...baseSession,
      mode: GAME_MODE.TEAM_2V2,
      players: [
        player('a', 'Ann', TEAM.FIRST, 2),
        player('b', 'Bob', TEAM.SECOND, 1),
        player('c', 'Cy', TEAM.FIRST, 2),
        player('d', 'Di', TEAM.SECOND, 1),
      ],
    } as SessionWithPlayers

    expect(getSessionTitle(session, t)).toBe('Ann & Cy versusShort Bob & Di')
    expect(getSessionScoreText(session)).toBe('2-1')
    expect(getPlayerNamesByIds(session, ['a', 'c'])).toBe('Ann & Cy')
  })

  it('reads winner_ids and falls back to winner_id', () => {
    expect(getGameWinnerIds({ winner_id: 'a', winner_ids: ['a', 'c'] })).toEqual(['a', 'c'])
    expect(getGameWinnerIds({ winner_id: 'b', winner_ids: null })).toEqual(['b'])
    expect(getGameWinnerIds({ winner_id: null })).toEqual([])
  })
})

describe('finish game winner options', () => {
  it('offers both players in 1v1 and submits winnerId', () => {
    expect(mapSessionPlayersToOptions(baseSession, t).map((o) => o.id)).toEqual(['a', 'b'])
    expect(parseWinnerSelection('a')).toEqual({ winnerId: 'a' })
  })

  it('offers teams in 2v2 and submits winnerTeam', () => {
    const session = {
      ...baseSession,
      mode: GAME_MODE.TEAM_2V2,
      players: [
        player('a', 'Ann', TEAM.FIRST, 0),
        player('b', 'Bob', TEAM.SECOND, 0),
        player('c', 'Cy', TEAM.FIRST, 0),
        player('d', 'Di', TEAM.SECOND, 0),
      ],
    } as SessionWithPlayers

    const options = mapSessionPlayersToOptions(session, t)
    expect(options).toHaveLength(2)
    expect(options[0].name).toContain('Ann & Cy')
    expect(parseWinnerSelection(options[1].id)).toEqual({ winnerTeam: TEAM.SECOND })
  })
})

describe('getDraftSeats', () => {
  it('orders seats by turn_order with team colours and rolls', () => {
    const seats = getDraftSeats({
      player1_id: 'a',
      player2_id: 'b',
      player_ids: ['a', 'b', 'c', 'd'],
      turn_order: ['c', 'b', 'a', 'd'],
      player_teams: { a: TEAM.FIRST, c: TEAM.FIRST, b: TEAM.SECOND, d: TEAM.SECOND },
      initial_roll: [
        { userID: 'a', roll: 40 },
        { userID: 'b', roll: 70 },
        { userID: 'c', roll: 90 },
        { userID: 'd', roll: 10 },
      ],
    })

    expect(seats.map((seat) => `${seat.seatLabel}:${seat.userId}`)).toEqual([
      'A:c',
      'B:b',
      'C:a',
      'D:d',
    ])
    expect(seats.map((seat) => seat.accent)).toEqual(['blue', 'green', 'blue', 'green'])
    expect(seats[0].roll).toBe(90)
  })
})
