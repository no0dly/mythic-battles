import { describe, it, expect } from "vitest";
import { createOptimisticDraftUpdate, getPlayerCards } from "../helpers";
import { createCardIdMap } from "@/utils/cards/createCardIdMap";
import type { Card, Draft } from "@/types/database.types";
import { CARD_TYPES, DRAFT_STATUS } from "@/types/constants";

const makeCard = (id: string, cost = 1): Card => ({
  id,
  unit_name: `Card ${id}`,
  unit_type: CARD_TYPES.MONSTER,
  cost,
  amount_of_card_activations: 1,
  strategic_value: 1,
  talents: [],
  class: [],
  origin: null,
  extra: null,
  image_url: "",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
});

const makeDraft = (overrides: Partial<Draft> = {}): Draft => ({
  id: "draft-1",
  game_id: "game-1",
  player1_id: "player-1",
  player2_id: "player-2",
  current_turn_user_id: "player-1",
  draft_pool: [],
  draft_history: null,
  draft_status: DRAFT_STATUS.DRAFT,
  initial_roll: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("createOptimisticDraftUpdate", () => {
  it("adds a new pick to draft history", () => {
    const result = createOptimisticDraftUpdate({
      draft: makeDraft(),
      cardId: "card-1",
      playerId: "player-1",
    });

    expect(result.draft_history.picks).toHaveLength(1);
    expect(result.draft_history.picks[0]).toMatchObject({
      card_id: "card-1",
      player_id: "player-1",
      pick_number: 1,
    });
  });

  it("alternates turn to opponent after pick", () => {
    const result = createOptimisticDraftUpdate({
      draft: makeDraft({ current_turn_user_id: "player-1" }),
      cardId: "card-1",
      playerId: "player-1",
    });

    expect(result.current_turn_user_id).toBe("player-2");
  });

  it("auto-adds companion pick when companionCardId is provided", () => {
    const result = createOptimisticDraftUpdate({
      draft: makeDraft(),
      cardId: "parent-card",
      companionCardId: "companion-card",
      playerId: "player-1",
    });

    expect(result.draft_history.picks).toHaveLength(2);
    expect(result.draft_history.picks[1]).toMatchObject({
      card_id: "companion-card",
      player_id: "player-1",
      pick_number: 2,
      auto: true,
    });
  });

  it("does not add companion when companionCardId is not provided", () => {
    const result = createOptimisticDraftUpdate({
      draft: makeDraft(),
      cardId: "card-1",
      playerId: "player-1",
    });

    expect(result.draft_history.picks).toHaveLength(1);
    expect(result.draft_history.picks[0].auto).toBeUndefined();
  });

  it("appends to existing picks with correct pick numbers", () => {
    const draft = makeDraft({
      draft_history: {
        picks: [
          { card_id: "card-0", player_id: "player-2", pick_number: 1, timestamp: "2024-01-01T00:00:00Z" },
        ],
      },
    });

    const result = createOptimisticDraftUpdate({
      draft,
      cardId: "card-1",
      playerId: "player-1",
    });

    expect(result.draft_history.picks).toHaveLength(2);
    expect(result.draft_history.picks[1].pick_number).toBe(2);
  });

  it("adds a bringsWith pick with cost_override when provided", () => {
    const result = createOptimisticDraftUpdate({
      draft: makeDraft(),
      cardId: "parent-card",
      bringsWithCardId: "bw-card",
      bringsWithCost: 2,
      playerId: "player-1",
    });

    expect(result.draft_history.picks).toHaveLength(2);
    expect(result.draft_history.picks[1]).toMatchObject({
      card_id: "bw-card",
      player_id: "player-1",
      pick_number: 2,
      cost_override: 2,
    });
    expect(result.draft_history.picks[1].auto).toBeUndefined();
  });

  it("assigns sequential pick numbers when companion and bringsWith are both present", () => {
    const result = createOptimisticDraftUpdate({
      draft: makeDraft(),
      cardId: "parent-card",
      companionCardId: "companion-card",
      bringsWithCardId: "bw-card",
      bringsWithCost: 1,
      playerId: "player-1",
    });

    expect(result.draft_history.picks).toHaveLength(3);
    expect(result.draft_history.picks[0].pick_number).toBe(1);
    expect(result.draft_history.picks[1].pick_number).toBe(2);
    expect(result.draft_history.picks[2].pick_number).toBe(3);
    expect(result.draft_history.picks[1].auto).toBe(true);
    expect(result.draft_history.picks[2].cost_override).toBe(1);
  });

  it("does not add bringsWith pick when bringsWithCardId is omitted", () => {
    const result = createOptimisticDraftUpdate({
      draft: makeDraft(),
      cardId: "parent-card",
      playerId: "player-1",
    });

    expect(result.draft_history.picks).toHaveLength(1);
    expect(result.draft_history.picks[0].cost_override).toBeUndefined();
  });
});

describe("getPlayerCards", () => {
  it("returns cards picked by the specified player", () => {
    const card = makeCard("card-1");
    const cardMap = createCardIdMap([card]);
    const draft = makeDraft({
      draft_history: {
        picks: [
          { card_id: "card-1", player_id: "player-1", pick_number: 1, timestamp: "2024-01-01T00:00:00Z" },
        ],
      },
    });

    const result = getPlayerCards(draft, cardMap, "player-1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("card-1");
  });

  it("does not return cards picked by the opponent", () => {
    const card = makeCard("card-1");
    const cardMap = createCardIdMap([card]);
    const draft = makeDraft({
      draft_history: {
        picks: [
          { card_id: "card-1", player_id: "player-2", pick_number: 1, timestamp: "2024-01-01T00:00:00Z" },
        ],
      },
    });

    const result = getPlayerCards(draft, cardMap, "player-1");
    expect(result).toHaveLength(0);
  });

  it("includes auto-picked companion cards in player cards", () => {
    const parentCard = makeCard("parent-card");
    const companionCard = makeCard("companion-card", 0);
    const cardMap = createCardIdMap([parentCard, companionCard]);
    const draft = makeDraft({
      draft_history: {
        picks: [
          { card_id: "parent-card", player_id: "player-1", pick_number: 1, timestamp: "2024-01-01T00:00:00Z" },
          { card_id: "companion-card", player_id: "player-1", pick_number: 2, timestamp: "2024-01-01T00:00:00Z", auto: true },
        ],
      },
    });

    const result = getPlayerCards(draft, cardMap, "player-1");
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toContain("companion-card");
  });

  it("returns empty array for null draft", () => {
    const cardMap = createCardIdMap([makeCard("card-1")]);
    expect(getPlayerCards(null, cardMap, "player-1")).toHaveLength(0);
  });

  it("returns empty array for null cardMap", () => {
    const draft = makeDraft({
      draft_history: {
        picks: [{ card_id: "card-1", player_id: "player-1", pick_number: 1, timestamp: "2024-01-01T00:00:00Z" }],
      },
    });
    expect(getPlayerCards(draft, undefined, "player-1")).toHaveLength(0);
  });
});
