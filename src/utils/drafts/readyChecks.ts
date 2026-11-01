import type { DraftReadyCheck } from '@/types/database.types'

type ReadyCheckPlayers = Pick<
  DraftReadyCheck,
  'first_player_id' | 'second_player_id' | 'ready_player_ids'
>

/** Rows written before ready_player_ids existed fall back to the two legacy columns. */
export const getReadyPlayerIds = (check: ReadyCheckPlayers | null | undefined): string[] => {
  if (!check) return []
  if (check.ready_player_ids && check.ready_player_ids.length > 0) {
    return check.ready_player_ids
  }
  return [check.first_player_id, check.second_player_id].filter(
    (id): id is string => !!id
  )
}
