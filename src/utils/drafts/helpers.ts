import type { DraftHistory, DraftPick, Draft, Card, UserSubset } from '@/types/database.types'
import { formatDisplayName } from '@/utils/users'
import { DRAFT_STATUS, GAME_STATUS, GAME_INVITATION_STATUS } from '@/types/constants'
import { DraftWithRelations, DraftState } from './interfaces'
import { DRAFT_STATE } from './constants'
import { OptimisticDraftUpdateInput, OptimisticDraftUpdateResult } from './interfaces'
import { type CardIdMap } from '@/utils/cards/createCardIdMap'

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

/**
* Get cards picked by a specific player
* @param draft - Draft object
* @param cards - Array of all cards
* @param playerId - ID of the player
* @returns Array of cards picked by the player
*/
export const getPlayerCards = (
  draft: Draft | null,
  cardsMap: CardIdMap | undefined,
  playerId: string
): Card[] => {
  if (!draft || !cardsMap) return []

  const draftHistory = parseDraftHistory(draft.draft_history)
  if (!draftHistory?.picks) return []

  return draftHistory.picks.reduce((acc, pick) => {

    if (pick.player_id !== playerId) return acc

    const card = cardsMap.get(pick.card_id)
    if (card) {
      acc.push(card)
    }
    return acc
  }, [] as Card[])
}

/**
* Get player name from players array with fallback
* @param players - Array of user profiles (subset with id, email, display_name, avatar_url)
* @param playerId - ID of the player
* @param fallbackKey - Translation key for fallback (e.g., "player1")
* @param t - Translation function
* @returns Formatted player name
*/
export const getPlayerName = (
  players: UserSubset[] | undefined,
  playerId: string,
  fallbackKey: string,
  t: (key: string) => string
): string => {
  if (!players) return t(fallbackKey)

  const player = players.find((p) => p.id === playerId)
  if (!player) return t(fallbackKey)

  return formatDisplayName(player.display_name, player.email)
}

/**
* Parse initial roll from draft
* @param draft - Draft object
* @returns Object with player1Roll and player2Roll, or null if not available
*/
export const parseInitialRoll = (
  draft: Draft | null
): { player1Roll: number; player2Roll: number } | null => {
  if (!draft?.initial_roll || !Array.isArray(draft.initial_roll)) {
    return null
  }

  const initialRoll = draft.initial_roll as Array<{
    userID: string
    roll: number
  }>

  const roll1 = initialRoll.find((r) => r.userID === draft.player1_id)
  const roll2 = initialRoll.find((r) => r.userID === draft.player2_id)

  return {
    player1Roll: roll1?.roll || 0,
    player2Roll: roll2?.roll || 0,
  }
}

/**
* Determine the current state of a draft based on draft status, game status, and invitation
* @param draft - Draft object with optional game and invitation
* @param userId - Current user ID
* @returns Draft state string
*/
export const getDraftState = (
  draft: DraftWithRelations | null | undefined,
  userId: string | null | undefined
): DraftState => {
  if (!draft || !userId) return DRAFT_STATE.LOADING

  // Если драфт в процессе, показать основной интерфейс
  if (draft.draft_status === DRAFT_STATUS.DRAFT) {
    const gameStatus = draft.game?.status
    const invitation = draft.invitation

    // Проверяем наличие pending приглашения
    const hasPendingInvitation = invitation?.status === GAME_INVITATION_STATUS.PENDING

    // Если есть pending приглашение
    if (hasPendingInvitation) {
      // Проверяем роль текущего пользователя в приглашении
      const isInviter = invitation.inviter_id === userId
      const isInvitee = invitation.invitee_id === userId

      if (isInviter) {
        // Создатель игры ждет принятия приглашения
        return DRAFT_STATE.WAITING_FOR_OPPONENT
      }

      if (isInvitee) {
        // Приглашенный игрок должен был принять приглашение через колокольчик
        // Но если он попал сюда, показываем ожидание (приглашение обрабатывается в колокольчике)
        return DRAFT_STATE.INVITATION_PENDING
      }
    }

    // Если приглашения нет или оно принято/отклонено, показываем драфт
    // Проверяем дополнительно статус игры
    if (
      gameStatus === GAME_STATUS.DRAFT ||
      gameStatus === GAME_STATUS.IN_PROGRESS ||
      invitation?.status === GAME_INVITATION_STATUS.ACCEPTED
    ) {
      // Игра началась, показываем драфт
      return DRAFT_STATE.DRAFT_IN_PROGRESS
    }

    // Если игра все еще в статусе INVITE_TO_DRAFT, но приглашение не pending
    // (возможно, было отклонено или еще не загрузилось)
    if (gameStatus === GAME_STATUS.INVITE_TO_DRAFT) {
      // Проверяем, есть ли вообще приглашение
      if (!invitation) {
        // Приглашение еще не создано или не загрузилось, ждем
        return DRAFT_STATE.WAITING_FOR_OPPONENT
      }
      // Если приглашение есть но не pending (accepted, rejected и т.д.), показываем драфт
      return DRAFT_STATE.DRAFT_IN_PROGRESS
    }

    // По умолчанию показываем драфт
    return DRAFT_STATE.DRAFT_IN_PROGRESS
  }

  if (draft.draft_status === DRAFT_STATUS.FINISHED) {
    return DRAFT_STATE.FINISHED
  }

  return DRAFT_STATE.UNKNOWN
}



export const createOptimisticDraftUpdate = ({
  draft,
  cardId,
  playerId,
  timestamp = new Date().toISOString(),
}: OptimisticDraftUpdateInput): OptimisticDraftUpdateResult => {
  const draftHistory = parseDraftHistory(draft.draft_history)
  const picks = draftHistory?.picks || []

  const nextPickNumber = picks.length + 1
  const newPick: DraftPick = {
    card_id: cardId,
    player_id: playerId,
    pick_number: nextPickNumber,
    timestamp,
  }

  const updatedPicks = [...picks, newPick]
  const updatedHistory: DraftHistory = {
    picks: updatedPicks,
    ...(draftHistory?.initial_roll && { initial_roll: draftHistory.initial_roll }),
  }

  const nextTurnUserId =
    draft.current_turn_user_id === draft.player1_id ? draft.player2_id : draft.player1_id

  return {
    draft_history: updatedHistory,
    current_turn_user_id: nextTurnUserId,
  }
}