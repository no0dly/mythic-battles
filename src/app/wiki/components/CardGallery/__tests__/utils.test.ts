import { describe, it, expect } from "vitest";
import { getFilteredData, getUniqueCosts } from "../utils";
import { DEFAULT_FILTER } from "@/stores/cardFilters";
import type { Card } from "@/types/database.types";
import { CARD_TYPES } from "@/types/database.types";

const mockCards: Card[] = [
  {
    id: "1",
    unit_name: "Zeus",
    unit_type: CARD_TYPES.GOD,
    cost: 5,
    amount_of_card_activations: 1,
    strategic_value: 10,
    talents: [],
    class: "god",
    image_url: "/zeus.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    unit_name: "Ares",
    unit_type: CARD_TYPES.GOD,
    cost: 4,
    amount_of_card_activations: 1,
    strategic_value: 9,
    talents: [],
    class: "god",
    image_url: "/ares.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    unit_name: "Athena",
    unit_type: CARD_TYPES.HERO,
    cost: 5,
    amount_of_card_activations: 1,
    strategic_value: 8,
    talents: [],
    class: "hero",
    image_url: "/athena.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    unit_name: "Minotaur",
    unit_type: CARD_TYPES.MONSTER,
    cost: 3,
    amount_of_card_activations: 1,
    strategic_value: 7,
    talents: [],
    class: "monster",
    image_url: "/minotaur.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("getFilteredData", () => {
  it("should return all cards when no filters are applied", () => {
    const result = getFilteredData(
      mockCards,
      "",
      DEFAULT_FILTER,
      DEFAULT_FILTER
    );
    expect(result).toHaveLength(4);
    expect(result).toEqual(mockCards);
  });

  it("should filter by search name (case insensitive)", () => {
    const result = getFilteredData(
      mockCards,
      "zeus",
      DEFAULT_FILTER,
      DEFAULT_FILTER
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Zeus");
  });

  it("should filter by search name with partial match", () => {
    const result = getFilteredData(
      mockCards,
      "athena",
      DEFAULT_FILTER,
      DEFAULT_FILTER
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Athena");
  });

  it("should filter by search name with uppercase input", () => {
    const result = getFilteredData(
      mockCards,
      "ARES",
      DEFAULT_FILTER,
      DEFAULT_FILTER
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Ares");
  });

  it("should filter by type", () => {
    const result = getFilteredData(
      mockCards,
      "",
      CARD_TYPES.GOD,
      DEFAULT_FILTER
    );
    expect(result).toHaveLength(2);
    expect(result.every((card) => card.unit_type === CARD_TYPES.GOD)).toBe(
      true
    );
  });

  it("should filter by cost", () => {
    const result = getFilteredData(mockCards, "", DEFAULT_FILTER, "5");
    expect(result).toHaveLength(2);
    expect(result.every((card) => card.cost === 5)).toBe(true);
  });

  it("should filter by multiple filters simultaneously", () => {
    const result = getFilteredData(
      mockCards,
      "ze",
      CARD_TYPES.GOD,
      "5"
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Zeus");
  });

  it("should return empty array when no cards match filters", () => {
    const result = getFilteredData(
      mockCards,
      "nonexistent",
      DEFAULT_FILTER,
      DEFAULT_FILTER
    );
    expect(result).toHaveLength(0);
  });

  it("should return empty array when type filter doesn't match", () => {
    const result = getFilteredData(
      mockCards,
      "",
      CARD_TYPES.TITAN,
      DEFAULT_FILTER
    );
    expect(result).toHaveLength(0);
  });

  it("should return empty array when cost filter doesn't match", () => {
    const result = getFilteredData(mockCards, "", DEFAULT_FILTER, "10");
    expect(result).toHaveLength(0);
  });

  it("should handle empty array input", () => {
    const result = getFilteredData(
      [],
      "",
      DEFAULT_FILTER,
      DEFAULT_FILTER
    );
    expect(result).toHaveLength(0);
  });
});

describe("getUniqueCosts", () => {
  it("should return unique costs sorted in ascending order", () => {
    const result = getUniqueCosts(mockCards);
    expect(result).toEqual([3, 4, 5]);
  });

  it("should handle cards with duplicate costs", () => {
    const cardsWithDuplicates: Card[] = [
      ...mockCards,
      {
        id: "5",
        unit_name: "Another Five Cost",
        unit_type: CARD_TYPES.GOD,
        cost: 5,
        amount_of_card_activations: 1,
        strategic_value: 10,
        talents: [],
        class: "god",
        image_url: "/another.jpg",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];
    const result = getUniqueCosts(cardsWithDuplicates);
    expect(result).toEqual([3, 4, 5]);
    expect(result.length).toBe(3);
  });

  it("should handle empty array", () => {
    const result = getUniqueCosts([]);
    expect(result).toEqual([]);
  });

  it("should handle single card", () => {
    const result = getUniqueCosts([mockCards[0]]);
    expect(result).toEqual([5]);
  });

  it("should handle cards with same cost", () => {
    const sameCostCards: Card[] = [
      {
        ...mockCards[0],
        id: "1",
        cost: 3,
      },
      {
        ...mockCards[1],
        id: "2",
        cost: 3,
      },
    ];
    const result = getUniqueCosts(sameCostCards);
    expect(result).toEqual([3]);
  });

  it("should handle cards with unsorted costs", () => {
    const unsortedCards: Card[] = [
      {
        ...mockCards[0],
        cost: 10,
      },
      {
        ...mockCards[1],
        cost: 1,
      },
      {
        ...mockCards[2],
        cost: 5,
      },
    ];
    const result = getUniqueCosts(unsortedCards);
    expect(result).toEqual([1, 5, 10]);
  });
});

