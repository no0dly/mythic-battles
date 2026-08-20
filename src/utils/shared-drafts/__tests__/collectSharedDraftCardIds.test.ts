import { describe, expect, it } from "vitest";
import { collectSharedDraftCardIds } from "../collectSharedDraftCardIds";
import { SPARTANS_ID, ZEUS_ID } from "./constants";

describe("collectSharedDraftCardIds", () => {
  it("deduplicates card ids across both players", () => {
    const ids = collectSharedDraftCardIds({
      player1_card_ids: [ZEUS_ID, SPARTANS_ID],
      player2_card_ids: [ZEUS_ID],
    });

    expect(ids).toEqual([ZEUS_ID, SPARTANS_ID]);
  });
});
