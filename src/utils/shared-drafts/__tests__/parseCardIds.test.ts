import { describe, expect, it } from "vitest";
import { parseCardIds, parseSharedDraftArmy, parseSharedDraftPicks } from "../parseCardIds";
import { PICK_TIMESTAMP, PLAYER_1_ID, SPARTANS_ID, ZEUS_ID } from "./constants";

describe("parseCardIds", () => {
  it("parses a valid uuid list", () => {
    expect(parseCardIds([ZEUS_ID, SPARTANS_ID])).toEqual([ZEUS_ID, SPARTANS_ID]);
  });

  it("returns an empty array for invalid payloads", () => {
    expect(parseCardIds(null)).toEqual([]);
    expect(parseCardIds(["not-a-uuid"])).toEqual([]);
  });
});

describe("parseSharedDraftArmy", () => {
  it("parses both player lists", () => {
    expect(parseSharedDraftArmy([ZEUS_ID], [SPARTANS_ID])).toEqual({
      player1_card_ids: [ZEUS_ID],
      player2_card_ids: [SPARTANS_ID],
    });
  });
});

describe("parseSharedDraftPicks", () => {
  const pick = { card_id: ZEUS_ID, player_id: "A", pick_number: 1, timestamp: PICK_TIMESTAMP };

  it("parses picks that use seat labels", () => {
    expect(parseSharedDraftPicks({ picks: [pick] })).toEqual([pick]);
  });

  it("returns no picks for older snapshots or real player ids", () => {
    expect(parseSharedDraftPicks(null)).toEqual([]);
    expect(parseSharedDraftPicks({ picks: [{ ...pick, player_id: PLAYER_1_ID }] })).toEqual([]);
  });
});
