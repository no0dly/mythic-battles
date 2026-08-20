import type { Card, SharedDraft } from "@/types/database.types";

export type SharedDraftWithCards = SharedDraft & {
  cards: Card[];
};
