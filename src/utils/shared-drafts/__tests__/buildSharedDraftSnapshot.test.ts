import { describe, expect, it } from "vitest";
import { GAME_MODE, TEAM } from "@/types/constants";
import { buildSharedDraftSnapshot } from "../buildSharedDraftSnapshot";
import { makeDraft } from "./makeDraft";
import {
  OUTSIDER_ID,
  PICK_TIMESTAMP,
  PLAYER_1_ID,
  PLAYER_2_ID,
  POOL_ONLY_CARD_ID,
  SOURCE_DRAFT_ID,
  SPARTANS_ID,
  ZEUS_ID,
} from "./constants";

describe("buildSharedDraftSnapshot", () => {
  it("replaces player ids with seat labels and keeps pick order", () => {
    const snapshot = buildSharedDraftSnapshot(makeDraft());

    expect(snapshot.source_draft_id).toBe(SOURCE_DRAFT_ID);
    expect(snapshot.draft_history).toEqual({
      picks: [
        { card_id: ZEUS_ID, player_id: "A", pick_number: 1, timestamp: PICK_TIMESTAMP, cost_override: 4 },
        { card_id: SPARTANS_ID, player_id: "B", pick_number: 2, timestamp: PICK_TIMESTAMP },
      ],
    });
    expect(JSON.stringify(snapshot)).not.toContain(PLAYER_1_ID);
    expect(JSON.stringify(snapshot)).not.toContain(PLAYER_2_ID);
  });

  it("stores armies in the legacy columns and the full pool for 1v1", () => {
    const snapshot = buildSharedDraftSnapshot(makeDraft());

    expect(snapshot.mode).toBe(GAME_MODE.ONE_VS_ONE);
    expect(snapshot.player1_card_ids).toEqual([ZEUS_ID]);
    expect(snapshot.player2_card_ids).toEqual([SPARTANS_ID]);
    expect(snapshot.armies).toBeNull();
    expect(snapshot.draft_pool).toEqual([ZEUS_ID, SPARTANS_ID, POOL_ONLY_CARD_ID]);
  });

  it("drops picks from players who are not seated", () => {
    const snapshot = buildSharedDraftSnapshot(
      makeDraft({
        draft_history: {
          picks: [{ card_id: ZEUS_ID, player_id: OUTSIDER_ID, pick_number: 1, timestamp: PICK_TIMESTAMP }],
        },
      }),
    );

    expect(snapshot.draft_history).toEqual({ picks: [] });
    expect(JSON.stringify(snapshot)).not.toContain(OUTSIDER_ID);
  });

  it("stores every army with teams for multiplayer drafts", () => {
    const snapshot = buildSharedDraftSnapshot(
      makeDraft({
        mode: GAME_MODE.TEAM_2V2,
        player_ids: [PLAYER_1_ID, PLAYER_2_ID, OUTSIDER_ID, SOURCE_DRAFT_ID],
        turn_order: [PLAYER_2_ID, PLAYER_1_ID, OUTSIDER_ID, SOURCE_DRAFT_ID],
        player_teams: {
          [PLAYER_1_ID]: TEAM.FIRST,
          [PLAYER_2_ID]: TEAM.SECOND,
          [OUTSIDER_ID]: TEAM.SECOND,
          [SOURCE_DRAFT_ID]: TEAM.FIRST,
        },
      }),
    );

    expect(snapshot.armies).toEqual([
      { team: TEAM.SECOND, card_ids: [SPARTANS_ID] },
      { team: TEAM.FIRST, card_ids: [ZEUS_ID] },
      { team: TEAM.SECOND, card_ids: [] },
      { team: TEAM.FIRST, card_ids: [] },
    ]);
    expect(snapshot.player1_card_ids).toEqual([SPARTANS_ID]);
  });
});
