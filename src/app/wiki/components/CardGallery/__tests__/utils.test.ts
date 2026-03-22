/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { getFilteredData, getFilteredMaps, getUniqueCosts, chunk } from "../utils";
import { DEFAULT_FILTER } from "@/stores/cardFilters";
import type { Card, GameMap } from "@/types/database.types";
import { CARD_TYPES, MAP_TYPE } from "@/types/constants";
import { MAPS_FILTER_VALUE } from "../utils";

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
  {
    id: "5",
    unit_name: "Spartan Shield",
    unit_type: CARD_TYPES.TROOP_ATTACHMENT,
    cost: 2,
    amount_of_card_activations: 1,
    strategic_value: 5,
    talents: [],
    class: "",
    image_url: "/shield.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockMaps: GameMap[] = [
  {
    id: "m1",
    name: "Sacred Grove",
    map_type: [MAP_TYPE.FOREST, MAP_TYPE.WATER],
    origin: null,
    image_url: "/grove.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "m2",
    name: "Ruined Temple",
    map_type: [MAP_TYPE.RUINS],
    origin: null,
    image_url: "/temple.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "m3",
    name: "Burning Fields",
    map_type: null,
    origin: null,
    image_url: "/fields.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// getFilteredData
// ---------------------------------------------------------------------------
describe("getFilteredData", () => {
  it("returns all cards when no filters are applied", () => {
    expect(getFilteredData(mockCards, "", [DEFAULT_FILTER], [DEFAULT_FILTER])).toHaveLength(5);
  });

  it("filters by search name (case insensitive)", () => {
    const result = getFilteredData(mockCards, "zeus", [DEFAULT_FILTER], [DEFAULT_FILTER]);
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Zeus");
  });

  it("filters by search name with uppercase input", () => {
    const result = getFilteredData(mockCards, "ARES", [DEFAULT_FILTER], [DEFAULT_FILTER]);
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Ares");
  });

  it("trims and normalizes search name", () => {
    const result = getFilteredData(mockCards, "  ZEUS  ", [DEFAULT_FILTER], [DEFAULT_FILTER]);
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Zeus");
  });

  it("filters by a single type", () => {
    const result = getFilteredData(mockCards, "", [CARD_TYPES.GOD], [DEFAULT_FILTER]);
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.unit_type === CARD_TYPES.GOD)).toBe(true);
  });

  it("filters by multiple types", () => {
    const result = getFilteredData(mockCards, "", [CARD_TYPES.GOD, CARD_TYPES.HERO], [DEFAULT_FILTER]);
    expect(result).toHaveLength(3);
  });

  it("returns no cards when only maps type is selected", () => {
    expect(getFilteredData(mockCards, "", [MAPS_FILTER_VALUE], [DEFAULT_FILTER])).toHaveLength(0);
  });

  it("filters cards correctly when maps type is mixed with card types", () => {
    const result = getFilteredData(mockCards, "", [CARD_TYPES.GOD, MAPS_FILTER_VALUE], [DEFAULT_FILTER]);
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.unit_type === CARD_TYPES.GOD)).toBe(true);
  });

  it("filters by a single cost", () => {
    const result = getFilteredData(mockCards, "", [DEFAULT_FILTER], ["5"]);
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.cost === 5)).toBe(true);
  });

  it("filters by multiple costs", () => {
    const result = getFilteredData(mockCards, "", [DEFAULT_FILTER], ["4", "5"]);
    expect(result).toHaveLength(3);
  });

  it("filters by type and cost simultaneously", () => {
    const result = getFilteredData(mockCards, "", [CARD_TYPES.GOD], ["5"]);
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Zeus");
  });

  it("filters by name, type, and cost simultaneously", () => {
    const result = getFilteredData(mockCards, "ze", [CARD_TYPES.GOD], ["5"]);
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Zeus");
  });

  it("returns empty array when no cards match", () => {
    expect(getFilteredData(mockCards, "nonexistent", [DEFAULT_FILTER], [DEFAULT_FILTER])).toHaveLength(0);
  });

  it("returns empty array when type filter doesn't match any card", () => {
    expect(getFilteredData(mockCards, "", [CARD_TYPES.TITAN], [DEFAULT_FILTER])).toHaveLength(0);
  });

  it("returns empty array when cost filter doesn't match any card", () => {
    expect(getFilteredData(mockCards, "", [DEFAULT_FILTER], ["10"])).toHaveLength(0);
  });

  it("filters by troop_attachment type", () => {
    const result = getFilteredData(mockCards, "", [CARD_TYPES.TROOP_ATTACHMENT], [DEFAULT_FILTER]);
    expect(result).toHaveLength(1);
    expect(result[0]?.unit_name).toBe("Spartan Shield");
  });

  it("returns empty array for empty input", () => {
    expect(getFilteredData([], "", [DEFAULT_FILTER], [DEFAULT_FILTER])).toHaveLength(0);
  });

  it("handles null/undefined data", () => {
    expect(getFilteredData(null as any, "", [DEFAULT_FILTER], [DEFAULT_FILTER])).toEqual([]);
    expect(getFilteredData(undefined as any, "", [DEFAULT_FILTER], [DEFAULT_FILTER])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getFilteredMaps
// ---------------------------------------------------------------------------
describe("getFilteredMaps", () => {
  it("returns all maps when no filters are active", () => {
    expect(getFilteredMaps(mockMaps, "", [DEFAULT_FILTER], [DEFAULT_FILTER], [DEFAULT_FILTER])).toHaveLength(3);
  });

  it("returns all maps when maps type is explicitly selected", () => {
    expect(getFilteredMaps(mockMaps, "", [MAPS_FILTER_VALUE], [DEFAULT_FILTER], [DEFAULT_FILTER])).toHaveLength(3);
  });

  it("returns no maps when card types are selected but not maps", () => {
    expect(getFilteredMaps(mockMaps, "", [CARD_TYPES.GOD], [DEFAULT_FILTER], [DEFAULT_FILTER])).toHaveLength(0);
  });

  it("returns no maps when cost filter is active", () => {
    expect(getFilteredMaps(mockMaps, "", [DEFAULT_FILTER], ["5"], [DEFAULT_FILTER])).toHaveLength(0);
  });

  it("filters maps by search name (case insensitive)", () => {
    const result = getFilteredMaps(mockMaps, "sacred", [DEFAULT_FILTER], [DEFAULT_FILTER], [DEFAULT_FILTER]);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Sacred Grove");
  });

  it("filters maps by search name uppercase", () => {
    const result = getFilteredMaps(mockMaps, "RUINED", [DEFAULT_FILTER], [DEFAULT_FILTER], [DEFAULT_FILTER]);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Ruined Temple");
  });

  it("returns no maps when search name matches nothing", () => {
    expect(getFilteredMaps(mockMaps, "zzznomatch", [DEFAULT_FILTER], [DEFAULT_FILTER], [DEFAULT_FILTER])).toHaveLength(0);
  });

  it("filters maps by a single map type", () => {
    const result = getFilteredMaps(mockMaps, "", [DEFAULT_FILTER], [DEFAULT_FILTER], [MAP_TYPE.RUINS]);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Ruined Temple");
  });

  it("filters maps by multiple map types (OR logic)", () => {
    const result = getFilteredMaps(mockMaps, "", [DEFAULT_FILTER], [DEFAULT_FILTER], [MAP_TYPE.FOREST, MAP_TYPE.RUINS]);
    expect(result).toHaveLength(2);
  });

  it("excludes maps with null map_type when map type filter is active", () => {
    const result = getFilteredMaps(mockMaps, "", [DEFAULT_FILTER], [DEFAULT_FILTER], [MAP_TYPE.FOREST]);
    // m3 has null map_type so should be excluded
    expect(result.find((m) => m.id === "m3")).toBeUndefined();
  });

  it("includes maps with null map_type when no map type filter is active", () => {
    const result = getFilteredMaps(mockMaps, "", [DEFAULT_FILTER], [DEFAULT_FILTER], [DEFAULT_FILTER]);
    expect(result.find((m) => m.id === "m3")).toBeTruthy();
  });

  it("returns empty array for empty input", () => {
    expect(getFilteredMaps([], "", [DEFAULT_FILTER], [DEFAULT_FILTER], [DEFAULT_FILTER])).toHaveLength(0);
  });

  it("handles null/undefined data", () => {
    expect(getFilteredMaps(null as any, "", [DEFAULT_FILTER], [DEFAULT_FILTER], [DEFAULT_FILTER])).toEqual([]);
    expect(getFilteredMaps(undefined as any, "", [DEFAULT_FILTER], [DEFAULT_FILTER], [DEFAULT_FILTER])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getUniqueCosts
// ---------------------------------------------------------------------------
describe("getUniqueCosts", () => {
  it("returns unique costs sorted ascending", () => {
    expect(getUniqueCosts(mockCards)).toEqual([2, 3, 4, 5]);
  });

  it("deduplicates costs", () => {
    const cards = [...mockCards, { ...mockCards[0]!, id: "6", cost: 5 }];
    expect(getUniqueCosts(cards)).toEqual([2, 3, 4, 5]);
  });

  it("handles empty array", () => {
    expect(getUniqueCosts([])).toEqual([]);
  });

  it("handles single card", () => {
    expect(getUniqueCosts([mockCards[0]!])).toEqual([5]);
  });

  it("sorts unsorted costs", () => {
    const cards = [
      { ...mockCards[0]!, cost: 10 },
      { ...mockCards[1]!, cost: 1 },
      { ...mockCards[2]!, cost: 5 },
    ];
    expect(getUniqueCosts(cards)).toEqual([1, 5, 10]);
  });

  it("handles null/undefined data", () => {
    expect(getUniqueCosts(null as any)).toEqual([]);
    expect(getUniqueCosts(undefined as any)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// chunk
// ---------------------------------------------------------------------------
describe("chunk", () => {
  it("splits array into even chunks", () => {
    expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
  });

  it("handles remainder in last chunk", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("handles empty array", () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it("handles array smaller than chunk size", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("handles chunk size of 1", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });

  it("handles chunk size equal to array length", () => {
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });

  it("handles invalid chunk size (0 or negative)", () => {
    expect(chunk([1, 2, 3], 0)).toEqual([]);
    expect(chunk([1, 2, 3], -1)).toEqual([]);
  });

  it("handles null/undefined array", () => {
    expect(chunk(null as any, 3)).toEqual([]);
    expect(chunk(undefined as any, 3)).toEqual([]);
  });

  it("works with string arrays", () => {
    expect(chunk(["a", "b", "c", "d", "e"], 2)).toEqual([["a", "b"], ["c", "d"], ["e"]]);
  });

  it("works with object arrays", () => {
    expect(chunk([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }], 2)).toEqual([
      [{ id: 1 }, { id: 2 }],
      [{ id: 3 }, { id: 4 }],
    ]);
  });
});
