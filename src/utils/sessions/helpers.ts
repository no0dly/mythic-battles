import { SOLO_PRACTICE_PLAYER_ID } from '@/types/constants'

export function isPracticeSession(session: { player2_id: string }): boolean {
  return session.player2_id === SOLO_PRACTICE_PLAYER_ID
}

export function getSessionGamesCount(
  session: {
    player2_id: string
    game_list: string[] | null
    finished_games_count?: number
  }
): number {
  if (isPracticeSession(session)) {
    return session.finished_games_count ?? 0
  }
  return session.game_list?.length ?? 0
}
