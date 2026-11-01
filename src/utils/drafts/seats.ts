import type { Draft, Team } from '@/types/database.types'
import { getPlayerAccent, type PlayerAccent } from './playerAccents'
import { SEAT_LABELS, getDraftPlayerIds, getPlayerTeam } from './turnOrder'

export interface DraftSeat {
  userId: string
  seatLabel: string
  team: Team | null
  accent: PlayerAccent
  roll: number
}

type SeatDraft = Pick<Draft, 'player1_id' | 'player2_id' | 'initial_roll'> &
  Partial<Pick<Draft, 'player_ids' | 'turn_order' | 'player_teams'>>

/** Seats in pick order (A, B, C, D); falls back to player order before seating exists. */
export const getDraftSeats = (draft: SeatDraft): DraftSeat[] => {
  const order = draft.turn_order?.length ? draft.turn_order : getDraftPlayerIds(draft)
  const rolls = Array.isArray(draft.initial_roll) ? draft.initial_roll : []
  const rollByUser = new Map(rolls.map((r) => [r.userID, r.roll]))

  return order.map((userId, index) => {
    const team = getPlayerTeam(draft.player_teams, userId)
    return {
      userId,
      seatLabel: SEAT_LABELS[index],
      team,
      accent: getPlayerAccent(index, team),
      roll: rollByUser.get(userId) ?? 0,
    }
  })
}
