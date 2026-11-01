import type {
  DraftPick,
  GameMode,
  InitialRoll,
  PlayerTeams,
  Team,
} from '@/types/database.types'
import { GAME_MODE, GAME_MODE_PLAYER_COUNT } from '@/types/constants'
import { sumPlayerSpentPoints } from './points'

export const SEAT_LABELS = ['A', 'B', 'C', 'D'] as const

const MAX_ROLL = 100

type DraftPlayersSource = {
  player1_id: string
  player2_id: string
  player_ids?: string[] | null
}

export const getDraftMode = (source: { mode?: GameMode | null }): GameMode =>
  source.mode ?? GAME_MODE.ONE_VS_ONE

export const isMultiplayerMode = (mode: GameMode): boolean =>
  mode !== GAME_MODE.ONE_VS_ONE

export const getModePlayerCount = (mode: GameMode): number =>
  GAME_MODE_PLAYER_COUNT[mode]

/** Works for drafts and sessions; rows written before player_ids existed fall back to the legacy pair. */
export const getDraftPlayerIds = (source: DraftPlayersSource): string[] =>
  source.player_ids && source.player_ids.length > 0
    ? source.player_ids
    : [source.player1_id, source.player2_id]

export const isDraftParticipant = (
  source: DraftPlayersSource,
  userId: string
): boolean => getDraftPlayerIds(source).includes(userId)

export const getPlayerTeam = (
  teams: PlayerTeams | null | undefined,
  userId: string
): Team | null => teams?.[userId] ?? null

export const getTeammateIds = (
  teams: PlayerTeams | null | undefined,
  userId: string
): string[] => {
  const team = getPlayerTeam(teams, userId)
  if (team === null || !teams) return []
  return Object.keys(teams).filter((id) => id !== userId && teams[id] === team)
}

export const rollInitiative = (
  playerIds: string[],
  random: () => number = Math.random
): InitialRoll[] =>
  playerIds.map((userID) => ({
    userID,
    roll: Math.floor(random() * MAX_ROLL) + 1,
  }))

/**
 * Seat index for a position in the pick sequence:
 * first round in seat order, every following round reversed.
 * 3 seats: A B C | C B A | C B A ...
 * 4 seats: A B C D | D C B A | D C B A ...
 */
export const seatForTurn = (turnIndex: number, seatCount: number): number =>
  turnIndex < seatCount
    ? turnIndex
    : seatCount - 1 - ((turnIndex - seatCount) % seatCount)

/** Ties keep the original player order (Array.prototype.sort is stable). */
const sortByRollDesc = (rolls: InitialRoll[]): string[] =>
  [...rolls].sort((a, b) => b.roll - a.roll).map((r) => r.userID)

/**
 * Free-for-all: seats by roll, highest first.
 * Teams: highest roll is A and their teammate is C; the higher roller of the
 * other team is B and the remaining player is D.
 */
export const buildTurnOrder = (
  rolls: InitialRoll[],
  teams?: PlayerTeams | null
): string[] => {
  const byRoll = sortByRollDesc(rolls)
  if (!teams) return byRoll

  const [seatA] = byRoll
  const teamA = teams[seatA]
  const teamAOthers = byRoll.filter((id) => id !== seatA && teams[id] === teamA)
  const otherTeam = byRoll.filter((id) => teams[id] !== teamA)

  if (teamAOthers.length !== 1 || otherTeam.length !== 2) {
    throw new Error('Team mode requires two teams of two players')
  }

  const [seatC] = teamAOthers
  const [seatB, seatD] = otherTeam
  return [seatA, seatB, seatC, seatD]
}

export interface MultiplayerTurnInput {
  turnOrder: string[]
  turnIndex: number
  picks: DraftPick[]
  playerAllowedPoints: number
  cardCostById: Map<string, number>
}

export interface MultiplayerTurn {
  userId: string
  turnIndex: number
}

const hasPointsLeft = (
  userId: string,
  { picks, playerAllowedPoints, cardCostById }: MultiplayerTurnInput
): boolean =>
  sumPlayerSpentPoints(picks, userId, cardCostById) < playerAllowedPoints

/**
 * Next seat in the sequence that still has points left. Every seat appears
 * within any `seatCount` consecutive turns, so `2 * seatCount` steps always
 * cover each player. If nobody has points left the turn stays where it is.
 */
export const computeNextMultiplayerTurn = (
  input: MultiplayerTurnInput
): MultiplayerTurn => {
  const { turnOrder, turnIndex } = input
  const seatCount = turnOrder.length

  for (let step = 1; step <= seatCount * 2; step++) {
    const candidateIndex = turnIndex + step
    const userId = turnOrder[seatForTurn(candidateIndex, seatCount)]
    if (hasPointsLeft(userId, input)) {
      return { userId, turnIndex: candidateIndex }
    }
  }

  return {
    userId: turnOrder[seatForTurn(turnIndex, seatCount)],
    turnIndex,
  }
}

/** Upcoming user ids after the current turn, skipping players for which `isDone` is true. */
export const getUpcomingTurns = (
  turnOrder: string[],
  turnIndex: number,
  count: number,
  isDone: (userId: string) => boolean = () => false
): string[] => {
  const seatCount = turnOrder.length
  const upcoming: string[] = []
  if (seatCount === 0) return upcoming

  const maxSteps = count * seatCount * 2
  for (let step = 1; step <= maxSteps && upcoming.length < count; step++) {
    const userId = turnOrder[seatForTurn(turnIndex + step, seatCount)]
    if (!isDone(userId)) upcoming.push(userId)
  }
  return upcoming
}
