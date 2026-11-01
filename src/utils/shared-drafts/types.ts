import type { Card, SharedDraft, SharedDraftArmyEntry } from "@/types/database.types";

export type SharedDraftWithCards = Omit<SharedDraft, "armies"> & {
  /** Every army in seat order; 1v1 snapshots have two */
  armies: SharedDraftArmyEntry[];
  cards: Card[];
};
