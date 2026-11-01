import type { DraftResetRequest } from '@/types/database.types'

type ResetRequestApprovers = Pick<
  DraftResetRequest,
  'opponent_id' | 'required_approver_ids' | 'approved_ids'
>

/** 1v1 requests only carry opponent_id; multiplayer requests list every approver. */
export const isMultiplayerResetRequest = (request: ResetRequestApprovers): boolean =>
  request.opponent_id === null

export const getResetApproverIds = (request: ResetRequestApprovers): string[] =>
  request.required_approver_ids && request.required_approver_ids.length > 0
    ? request.required_approver_ids
    : request.opponent_id
      ? [request.opponent_id]
      : []

export const hasApprovedReset = (request: ResetRequestApprovers, userId: string): boolean =>
  request.approved_ids?.includes(userId) ?? false
