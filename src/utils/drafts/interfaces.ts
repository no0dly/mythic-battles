import { ValueOf } from "@/types/interfaces";
import { DRAFT_STATE } from "./constants";
import { Draft, DraftHistory, Game, GameInvitation } from "@/types/database.types";

export type DraftState = ValueOf<typeof DRAFT_STATE>;

export type DraftWithRelations = Draft & {
  game?: Game
  invitation?: GameInvitation
}

export interface OptimisticDraftUpdateInput {
  draft: Draft
  cardId: string
  playerId: string
  timestamp?: string
}

export interface OptimisticDraftUpdateResult {
  draft_history: DraftHistory
  current_turn_user_id: string
}