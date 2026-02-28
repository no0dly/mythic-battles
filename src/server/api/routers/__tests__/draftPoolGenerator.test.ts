import { describe, it, expect } from "vitest";
import { generateDraftPool } from "../drafts/draftPoolGenerator";
import type { Card } from "@/types/database.types";
import { ALL_VALUE, CARD_ORIGIN, CARD_TYPES } from "@/types/constants";
import type { DraftPoolConfig } from "@/types/draft-settings.types";

const makeCard = (
  id: string,
  type: string,
  cost: number,
  origin: string | null = null,
): Card => ({
  id,
  unit_name: `Card ${id}`,
  unit_type: type as Card["unit_type"],
  cost,
  amount_of_card_activations: 1,
  strategic_value: 1,
  talents: [],
  class: [],
  origin: origin as Card["origin"],
  image_url: "",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
});

const BASE_CONFIG: DraftPoolConfig = {
  draft_size: 1,
  gods_amount: 0,
  titans_amount: 0,
  troop_attachment_amount: 0,
  origins: [ALL_VALUE],
};

describe("generateDraftPool - origin filtering", () => {
  const asgMonster = makeCard("asg-1", CARD_TYPES.MONSTER, 1, CARD_ORIGIN.ASG);
  const chtMonster = makeCard("cht-1", CARD_TYPES.MONSTER, 1, CARD_ORIGIN.CHT);
  const nullOriginMonster = makeCard("null-1", CARD_TYPES.MONSTER, 1, null);

  it("includes all cards when origins contains ALL_VALUE", () => {
    // With ALL_VALUE and draft_size: 2, both origin cards are candidates
    const result = generateDraftPool([asgMonster, chtMonster], {
      ...BASE_CONFIG,
      draft_size: 2,
      origins: [ALL_VALUE],
    });

    expect(result.cardIds).toContain(asgMonster.id);
    expect(result.cardIds).toContain(chtMonster.id);
  });

  it("filters to only matching origin cards", () => {
    const result = generateDraftPool([asgMonster, chtMonster], {
      ...BASE_CONFIG,
      origins: [CARD_ORIGIN.ASG],
    });

    expect(result.cardIds).toContain(asgMonster.id);
    expect(result.cardIds).not.toContain(chtMonster.id);
  });

  it("excludes cards with null origin when specific origins are given", () => {
    // Only asgMonster passes the origin filter; nullOriginMonster does not
    const result = generateDraftPool([asgMonster, nullOriginMonster], {
      ...BASE_CONFIG,
      origins: [CARD_ORIGIN.ASG],
    });

    expect(result.cardIds).toContain(asgMonster.id);
    expect(result.cardIds).not.toContain(nullOriginMonster.id);
  });

  it("includes cards with null origin when ALL_VALUE is selected", () => {
    // draft_size: 2 forces both cost-1 cards to be picked
    const result = generateDraftPool([asgMonster, nullOriginMonster], {
      ...BASE_CONFIG,
      draft_size: 2,
      origins: [ALL_VALUE],
    });

    expect(result.cardIds).toContain(asgMonster.id);
    expect(result.cardIds).toContain(nullOriginMonster.id);
  });

  it("supports multiple origins", () => {
    // draft_size: 2 with exactly 2 cards that pass the filter → both are picked
    const result = generateDraftPool([asgMonster, chtMonster, nullOriginMonster], {
      ...BASE_CONFIG,
      draft_size: 2,
      origins: [CARD_ORIGIN.ASG, CARD_ORIGIN.CHT],
    });

    expect(result.cardIds).toContain(asgMonster.id);
    expect(result.cardIds).toContain(chtMonster.id);
    expect(result.cardIds).not.toContain(nullOriginMonster.id);
  });

  it("returns correct selectedCount", () => {
    const result = generateDraftPool([asgMonster, chtMonster], {
      ...BASE_CONFIG,
      draft_size: 2,
      origins: [ALL_VALUE],
    });

    expect(result.selectedCount).toBe(result.cardIds.length);
  });

  it("throws when no cards are available after origin filtering", () => {
    // No CHT cards exist, so origin filter produces empty pool
    expect(() =>
      generateDraftPool([asgMonster], {
        ...BASE_CONFIG,
        origins: [CARD_ORIGIN.CHT],
      }),
    ).toThrow();
  });
});

describe("generateDraftPool - fixed card types", () => {
  it("selects the requested number of gods", () => {
    const god1 = makeCard("god-1", CARD_TYPES.GOD, 3, CARD_ORIGIN.ASG);
    const god2 = makeCard("god-2", CARD_TYPES.GOD, 3, CARD_ORIGIN.CHT);
    // Need at least one monster to satisfy draft_size: 1
    const monster = makeCard("mon-1", CARD_TYPES.MONSTER, 1, CARD_ORIGIN.ASG);

    const result = generateDraftPool([god1, god2, monster], {
      ...BASE_CONFIG,
      gods_amount: 2,
    });

    expect(result.cardIds).toContain(god1.id);
    expect(result.cardIds).toContain(god2.id);
  });

  it("god origin filtering respects the origins config", () => {
    const asgGod = makeCard("god-asg", CARD_TYPES.GOD, 3, CARD_ORIGIN.ASG);
    const chtGod = makeCard("god-cht", CARD_TYPES.GOD, 3, CARD_ORIGIN.CHT);
    const monster = makeCard("mon-1", CARD_TYPES.MONSTER, 1, CARD_ORIGIN.ASG);

    const result = generateDraftPool([asgGod, chtGod, monster], {
      ...BASE_CONFIG,
      gods_amount: 1,
      origins: [CARD_ORIGIN.ASG],
    });

    expect(result.cardIds).toContain(asgGod.id);
    expect(result.cardIds).not.toContain(chtGod.id);
  });
});
