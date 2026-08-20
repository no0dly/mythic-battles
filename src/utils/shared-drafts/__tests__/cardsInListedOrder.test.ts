import { describe, expect, it } from "vitest";
import { CARD_TYPES } from "@/types/constants";
import { cardsInListedOrder } from "../cardsInListedOrder";
import { SPARTANS_ID, ZEUS_ID } from "./constants";
import { makeCard } from "./makeCard";

describe("cardsInListedOrder", () => {
  it("returns cards in the listed id order", () => {
    const zeus = makeCard({ id: ZEUS_ID, unit_name: "Zeus", cost: 6 });
    const spartans = makeCard({
      id: SPARTANS_ID,
      unit_name: "Spartans",
      unit_type: CARD_TYPES.TROOP,
      cost: 1,
    });

    expect(cardsInListedOrder([SPARTANS_ID, ZEUS_ID], [zeus, spartans])).toEqual(
      [spartans, zeus],
    );
  });
});
