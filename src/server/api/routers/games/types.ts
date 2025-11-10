import type { Game, Draft, DraftHistory, DraftSettings } from '@/types/database.types'

// Game data from Supabase with users join
export type GameWithUserJoin = Game & {
  users: {
    display_name: string
  } | null
}

// Draft Information Game
export type GameWithDraft = Game & {
  draft: (Draft & {
    parsed_draft_history: DraftHistory | null
  }) | null
  created_by_name?: string | null
}

// Game with additional data for UI
export type GameDetail = {
  id: string
  game_number: number
  status: string
  winner_id: string | null
  created_at: string
  finished_at: string | null
  draft_settings: DraftSettings
  draft: {
    id: string
    draft_status: string
    draft_history: DraftHistory | null
    player1_id: string
    player2_id: string
    draft_total_cost: number
  } | null
}

