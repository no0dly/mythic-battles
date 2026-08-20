import type { Card } from "@/types/database.types";
import type { SharedDraftWithCards } from "@/utils/shared-drafts/types";

export interface SharedDraftPreviewProps {
  draft: SharedDraftWithCards;
  onCardClick: (card: Card) => void;
}
