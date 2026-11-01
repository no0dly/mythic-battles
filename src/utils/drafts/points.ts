import type { DraftPick } from '@/types/database.types'

export const sumPlayerSpentPoints = (
  picks: DraftPick[],
  playerId: string,
  cardCostById: Map<string, number>
): number =>
  picks
    .filter((p) => p.player_id === playerId)
    .reduce((sum, pick) => {
      if (pick.cost_override !== undefined) {
        return sum + pick.cost_override
      }
      return sum + (cardCostById.get(pick.card_id) ?? 0)
    }, 0)
