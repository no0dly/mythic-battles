import { parseDraftHistory } from "@/utils/drafts";
import { useMemo } from "react";
import type { Draft } from "@/types/database.types";

export default function useGetPickedCardsIDs(draft: Draft): Set<string> {
  const draftHistory = useMemo(() => {
    if (!draft) return null;
    return parseDraftHistory(draft.draft_history);
  }, [draft]);

  const pickedCardIdsString = useMemo(() => {
    if (!draftHistory?.picks) return "";
    return draftHistory.picks
      .map((pick) => pick.card_id)
      .sort()
      .join(",");
  }, [draftHistory]);

  const pickedCardIds = useMemo(() => {
    const baseSet = pickedCardIdsString
      ? new Set(pickedCardIdsString.split(","))
      : new Set<string>();

    return baseSet;
  }, [pickedCardIdsString]);

  return pickedCardIds;
}