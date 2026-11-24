import type { Card, DraftPick, SharedDraft, SharedDraftArmyEntry } from "@/types/database.types";

export type SharedDraftWithCards = Omit<
  SharedDraft,
  "armies" | "source_draft_id" | "draft_history" | "draft_pool"
> & {
  /** Every army in seat order; 1v1 snapshots have two */
  armies: SharedDraftArmyEntry[];
  /** Picks in order with player_id set to the seat label (A..D); empty for older snapshots */
  picks: DraftPick[];
  draft_pool: string[];
  /** Cards from the armies, picks and pool */
  cards: Card[];
};
