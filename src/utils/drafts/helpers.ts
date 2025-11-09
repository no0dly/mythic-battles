import type { DraftHistory, DraftPick } from '@/types/database.types'

/**
* Parse draft_history from JSONB
* @param history - JSONB data from the database (can be a string or an object)
* @returns Typed DraftHistory or null
*/
export const parseDraftHistory = (history: unknown): DraftHistory | null => {
  if (!history) return null

  try {
    let parsed = history

    if (typeof history === 'string') {
      parsed = JSON.parse(history)
    }

    if (Array.isArray(parsed)) {
      return { picks: [] }
    }

    const draftHistory = parsed as DraftHistory

    if (!draftHistory.picks || !Array.isArray(draftHistory.picks)) {
      return { picks: [] }
    }

    return draftHistory
  } catch {
    return null
  }
}

/**
* Sort picks by index number
* @param picks - Array of picks
* @returns Sorted array of picks
*/
export const sortPicksByNumber = (picks: DraftPick[]): DraftPick[] => {
  return [...picks].sort((a, b) => a.pick_number - b.pick_number)
}

/**
* Checks if there are picks in the draft history
* @param history - Draft history
* @returns true if there is at least one pick
*/
export const hasPicks = (history: DraftHistory | null): boolean => {
  return !!(history?.picks && history.picks.length > 0)
}