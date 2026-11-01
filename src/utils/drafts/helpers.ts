import type { DraftHistory, DraftPick, Draft, Card, UserSubset, InitialRoll } from '@/types/database.types'
import { sumPlayerSpentPoints } from './points'
import {
  computeNextMultiplayerTurn,
  getDraftMode,
  getDraftPlayerIds,
  isMultiplayerMode,
} from './turnOrder'
import { formatDisplayName } from '@/utils/users'
import { DRAFT_STATUS, GAME_STATUS, GAME_INVITATION_STATUS } from '@/types/constants'
import { DraftWithRelations, DraftState } from './interfaces'
import { DRAFT_STATE } from './constants'
import { OptimisticDraftUpdateInput, OptimisticDraftUpdateResult } from './interfaces'
import { type CardIdMap } from '@/utils/cards/createCardIdMap'
import { SOLO_PRACTICE_PLAYER_ID } from '@/types/constants'

export const getOpponentPlayerId = (draft: {
  player1_id: string
  player2_id: string
  current_turn_user_id: string
}): string =>
  draft.current_turn_user_id === draft.player1_id
    ? draft.player2_id
    : draft.player1_id

export const isPracticeDraft = (draft: { player2_id: string }): boolean =>
  draft.player2_id === SOLO_PRACTICE_PLAYER_ID

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
 * Group picks by card so a unit can show every time it was selected.
 */
export const groupPicksByCardId = (
  picks: DraftPick[]
): Map<string, DraftPick[]> => {
  const grouped = new Map<string, DraftPick[]>()

  for (const pick of picks) {
    const existing = grouped.get(pick.card_id)
    if (existing) {
      existing.push(pick)
    } else {
      grouped.set(pick.card_id, [pick])
    }
  }

  return grouped
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

  // Если драфт в процессе (включая состояние запроса на сброс), показать основной интерфейс
  if (draft.draft_status === DRAFT_STATUS.DRAFT || draft.draft_status === DRAFT_STATUS.RESET_REQUESTED) {
    const gameStatus = draft.game?.status
    const invitation = draft.invitation

    if (isPracticeDraft(draft)) {
      return DRAFT_STATE.DRAFT_IN_PROGRESS
    }

    if (isMultiplayerMode(getDraftMode(draft)) && draft.invitations?.length) {
      const pending = draft.invitations.filter(
        (inv) => inv.status === GAME_INVITATION_STATUS.PENDING
      )
      if (pending.some((inv) => inv.invitee_id === userId)) {
        return DRAFT_STATE.INVITATION_PENDING
      }
      if (pending.length > 0) {
        return DRAFT_STATE.WAITING_FOR_OPPONENT
      }
    }

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

/**
 * Matches server pickCard turn logic: alternate unless opponent has spent all allowed points.
 */
export const computeNextTurnUserId = (
  draft: Pick<Draft, 'player1_id' | 'player2_id' | 'current_turn_user_id'>,
  picks: DraftPick[],
  playerAllowedPoints: number,
  cardCostById: Map<string, number>
): string => {
  const pickingPlayerId = draft.current_turn_user_id
  const opponentId = getOpponentPlayerId(draft)
  const opponentSpent = sumPlayerSpentPoints(picks, opponentId, cardCostById)
  const opponentHasReachedMax = opponentSpent >= playerAllowedPoints
  return opponentHasReachedMax ? pickingPlayerId : opponentId
}

type TurnDraft = Pick<Draft, 'player1_id' | 'player2_id' | 'current_turn_user_id'> &
  Pick<Partial<Draft>, 'mode' | 'turn_order' | 'turn_index'>

/**
 * Next turn for any mode. 1v1 keeps the original alternating rule;
 * multiplayer modes follow the A B C | C B A ... sequence.
 */
export const computeNextTurn = (
  draft: TurnDraft,
  picks: DraftPick[],
  playerAllowedPoints: number,
  cardCostById: Map<string, number>
): { userId: string; turnIndex: number } => {
  const turnIndex = draft.turn_index ?? 0

  if (!isMultiplayerMode(getDraftMode(draft)) || !draft.turn_order?.length) {
    return {
      userId: computeNextTurnUserId(draft, picks, playerAllowedPoints, cardCostById),
      turnIndex,
    }
  }

  return computeNextMultiplayerTurn({
    turnOrder: draft.turn_order,
    turnIndex,
    picks,
    playerAllowedPoints,
    cardCostById,
  })
}

export const createOptimisticDraftUpdate = ({
  draft,
  cardId,
  companionCardId,
  bringsWithCardId,
  bringsWithCost,
  playerId,
  timestamp = new Date().toISOString(),
  playerAllowedPoints,
  cardCostById,
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

  if (companionCardId) {
    updatedPicks.push({
      card_id: companionCardId,
      player_id: playerId,
      pick_number: updatedPicks.length + 1,
      timestamp,
      auto: true,
    })
  }

  if (bringsWithCardId && bringsWithCost !== undefined) {
    updatedPicks.push({
      card_id: bringsWithCardId,
      player_id: playerId,
      pick_number: updatedPicks.length + 1,
      timestamp,
      cost_override: bringsWithCost,
    })
  }

  const updatedHistory: DraftHistory = {
    picks: updatedPicks,
    ...(draftHistory?.initial_roll && { initial_roll: draftHistory.initial_roll }),
  }

  if (playerAllowedPoints !== undefined && cardCostById) {
    const nextTurn = computeNextTurn(draft, updatedPicks, playerAllowedPoints, cardCostById)
    return {
      draft_history: updatedHistory,
      current_turn_user_id: nextTurn.userId,
      turn_index: nextTurn.turnIndex,
    }
  }

  return {
    draft_history: updatedHistory,
    current_turn_user_id:
      draft.current_turn_user_id === draft.player1_id
        ? draft.player2_id
        : draft.player1_id,
  }
}

/**
 * Initial rolls for every participant in seat order (or player order for 1v1).
 */
export const getInitialRolls = (draft: Draft | null): InitialRoll[] => {
  if (!draft?.initial_roll || !Array.isArray(draft.initial_roll)) return []
  const order = draft.turn_order?.length ? draft.turn_order : getDraftPlayerIds(draft)
  const rollByUser = new Map(draft.initial_roll.map((r) => [r.userID, r.roll]))
  return order.map((userID) => ({ userID, roll: rollByUser.get(userID) ?? 0 }))
}