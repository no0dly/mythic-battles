import { describe, expect, it } from "vitest";
import { totalCardCost } from "../totalCardCost";
import { SPARTANS_ID } from "./constants";
import { makeCard } from "./makeCard";

describe("totalCardCost", () => {
  it("sums card costs", () => {
    expect(
      totalCardCost([
        makeCard({ cost: 6 }),
        makeCard({ id: SPARTANS_ID, cost: 1 }),
      ]),
    ).toBe(7);
  });
});
