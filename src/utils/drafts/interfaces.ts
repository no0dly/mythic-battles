import { ValueOf } from "@/types/interfaces";
import { DRAFT_STATE } from "./constants";
import { Draft, DraftHistory, Game, GameInvitation, DraftResetRequest, DraftReadyCheck } from "@/types/database.types";

export type DraftState = ValueOf<typeof DRAFT_STATE>;

export type DraftWithRelations = Draft & {
  game?: Game
  invitation?: GameInvitation
  resetRequest?: DraftResetRequest
  readyCheck?: DraftReadyCheck
}

export interface OptimisticDraftUpdateInput {
  draft: Draft
  cardId: string
  companionCardId?: string
  bringsWithCardId?: string
  bringsWithCost?: number
  playerId: string
  timestamp?: string
  /** When set with cardCostById, next turn matches server pickCard logic */
  playerAllowedPoints?: number
  cardCostById?: Map<string, number>
}

export interface OptimisticDraftUpdateResult {
  draft_history: DraftHistory
  current_turn_user_id: string
}