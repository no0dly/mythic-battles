import type { Team } from '@/types/database.types'
import { TEAM } from '@/types/constants'

export type PlayerAccent = 'blue' | 'green' | 'amber' | 'rose'

/** Free-for-all colours by seat; blue/green match the original 1v1 colours. */
const SEAT_ACCENTS: readonly PlayerAccent[] = ['blue', 'green', 'amber', 'rose']

export const TEAM_ACCENTS: Record<Team, PlayerAccent> = {
  [TEAM.FIRST]: 'blue',
  [TEAM.SECOND]: 'green',
}

export const getPlayerAccent = (seatIndex: number, team: Team | null): PlayerAccent =>
  team !== null ? TEAM_ACCENTS[team] : SEAT_ACCENTS[seatIndex % SEAT_ACCENTS.length]

export const PLAYER_ACCENT_STYLES: Record<
  PlayerAccent,
  {
    border: string
    badge: string
    title: string
    historyRow: string
    historyBubble: string
    turnBorder: string
  }
> = {
  blue: {
    border: 'border-blue-200 bg-blue-50/70',
    badge: 'bg-blue-100 text-blue-700',
    title: 'text-blue-900',
    historyRow: 'border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100',
    historyBubble: 'bg-blue-600',
    turnBorder: 'border-blue-500',
  },
  green: {
    border: 'border-green-200 bg-green-50/70',
    badge: 'bg-green-100 text-green-700',
    title: 'text-green-900',
    historyRow: 'border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100',
    historyBubble: 'bg-green-600',
    turnBorder: 'border-green-500',
  },
  amber: {
    border: 'border-amber-200 bg-amber-50/70',
    badge: 'bg-amber-100 text-amber-700',
    title: 'text-amber-900',
    historyRow: 'border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100',
    historyBubble: 'bg-amber-600',
    turnBorder: 'border-amber-500',
  },
  rose: {
    border: 'border-rose-200 bg-rose-50/70',
    badge: 'bg-rose-100 text-rose-700',
    title: 'text-rose-900',
    historyRow: 'border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100',
    historyBubble: 'bg-rose-600',
    turnBorder: 'border-rose-500',
  },
}
