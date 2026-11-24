import type { Draft, DraftPick, SharedDraftArmyEntry, SharedDraftInsert } from "@/types/database.types";
import { parseDraftHistory, sortPicksByNumber } from "@/utils/drafts/helpers";
import { getDraftSeats } from "@/utils/drafts/seats";
import { getDraftMode, isMultiplayerMode } from "@/utils/drafts/turnOrder";

type SnapshotDraft = Pick<
  Draft,
  | "id"
  | "player1_id"
  | "player2_id"
  | "initial_roll"
  | "draft_history"
  | "draft_pool"
  | "map_id"
  | "map_side"
  | "mode"
  | "player_ids"
  | "turn_order"
  | "player_teams"
>;

export type SharedDraftSnapshot = Omit<SharedDraftInsert, "slug" | "title">;

/** Builds an anonymous shared-draft row: player ids become seat labels (A..D). */
export const buildSharedDraftSnapshot = (draft: SnapshotDraft): SharedDraftSnapshot => {
  const seats = getDraftSeats(draft);
  const seatLabelByUserId = new Map(seats.map((seat) => [seat.userId, seat.seatLabel]));
  const picks = sortPicksByNumber(parseDraftHistory(draft.draft_history)?.picks ?? []);

  const armies: SharedDraftArmyEntry[] = seats.map((seat) => ({
    team: seat.team,
    card_ids: picks
      .filter((pick) => pick.player_id === seat.userId)
      .map((pick) => pick.card_id),
  }));

  const anonymousPicks: DraftPick[] = picks.flatMap((pick) => {
    const seatLabel = seatLabelByUserId.get(pick.player_id);
    return seatLabel ? [{ ...pick, player_id: seatLabel }] : [];
  });

  const mode = getDraftMode(draft);

  return {
    source_draft_id: draft.id,
    mode,
    player1_card_ids: armies[0]?.card_ids ?? [],
    player2_card_ids: armies[1]?.card_ids ?? [],
    armies: isMultiplayerMode(mode) ? armies : null,
    map_id: draft.map_id,
    map_side: draft.map_side,
    draft_history: { picks: anonymousPicks },
    draft_pool: draft.draft_pool ?? [],
  };
};
