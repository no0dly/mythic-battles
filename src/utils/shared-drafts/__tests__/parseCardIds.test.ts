import { describe, expect, it } from "vitest";
import { parseCardIds, parseSharedDraftArmy } from "../parseCardIds";
import { SPARTANS_ID, ZEUS_ID } from "./constants";

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
