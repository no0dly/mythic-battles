import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCardGalleryFilter } from "../hooks/useCardGalleryFilter";
import { DEFAULT_FILTER } from "@/stores/cardFilters";
import { CARD_TYPES, MAP_TYPE } from "@/types/constants";
import { MAPS_FILTER_VALUE } from "@/app/wiki/components/CardGallery/utils";

// ---------------------------------------------------------------------------
// Store mock
// ---------------------------------------------------------------------------
const mockStore = {
  searchName: "",
  selectedTypes: [DEFAULT_FILTER] as string[],
  selectedCosts: [DEFAULT_FILTER] as string[],
  selectedMapTypes: [DEFAULT_FILTER] as string[],
  setSearchName: vi.fn(),
  setSelectedTypes: vi.fn(),
  setSelectedCosts: vi.fn(),
  setSelectedMapTypes: vi.fn(),
  clearFilters: vi.fn(),
};

vi.mock("@/stores/cardFilters", () => ({
  DEFAULT_FILTER: "all",
  useSearchName: () => mockStore.searchName,
  useSelectedTypes: () => mockStore.selectedTypes,
  useSelectedCosts: () => mockStore.selectedCosts,
  useSelectedMapTypes: () => mockStore.selectedMapTypes,
  useFilterActions: () => ({
    setSearchName: mockStore.setSearchName,
    setSelectedTypes: mockStore.setSelectedTypes,
    setSelectedCosts: mockStore.setSelectedCosts,
    setSelectedMapTypes: mockStore.setSelectedMapTypes,
    clearFilters: mockStore.clearFilters,
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("debounce", () => ({ default: (fn: unknown) => fn }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderHookWithCosts = (uniqueCosts: number[] = [3, 4, 5]) =>
  renderHook(() => useCardGalleryFilter(uniqueCosts));

beforeEach(() => {
  vi.clearAllMocks();
  mockStore.searchName = "";
  mockStore.selectedTypes = [DEFAULT_FILTER];
  mockStore.selectedCosts = [DEFAULT_FILTER];
  mockStore.selectedMapTypes = [DEFAULT_FILTER];
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useCardGalleryFilter", () => {
  describe("initial values", () => {
    it("mapsSelected is false when selectedTypes is DEFAULT_FILTER", () => {
      const { result } = renderHookWithCosts();
      expect(result.current.mapsSelected).toBe(false);
    });

    it("mapsSelected is true when selectedTypes includes MAPS_FILTER_VALUE", () => {
      mockStore.selectedTypes = [MAPS_FILTER_VALUE];
      const { result } = renderHookWithCosts();
      expect(result.current.mapsSelected).toBe(true);
    });

    it("hasActiveFilters is false with all defaults", () => {
      const { result } = renderHookWithCosts();
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("hasActiveFilters is true when searchName is set", () => {
      mockStore.searchName = "zeus";
      const { result } = renderHookWithCosts();
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("hasActiveFilters is true when types filter is active", () => {
      mockStore.selectedTypes = [CARD_TYPES.GOD];
      const { result } = renderHookWithCosts();
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("hasActiveFilters is true when cost filter is active", () => {
      mockStore.selectedCosts = ["5"];
      const { result } = renderHookWithCosts();
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("hasActiveFilters is true when map type filter is active", () => {
      mockStore.selectedMapTypes = ["ruins"];
      const { result } = renderHookWithCosts();
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("multiSelect value mapping", () => {
    it("multiSelectTypeValue is [] when selectedTypes is DEFAULT_FILTER", () => {
      const { result } = renderHookWithCosts();
      expect(result.current.multiSelectTypeValue).toEqual([]);
    });

    it("multiSelectTypeValue reflects active selection", () => {
      mockStore.selectedTypes = [CARD_TYPES.GOD, CARD_TYPES.HERO];
      const { result } = renderHookWithCosts();
      expect(result.current.multiSelectTypeValue).toEqual([CARD_TYPES.GOD, CARD_TYPES.HERO]);
    });

    it("multiSelectCostValue is [] when selectedCosts is DEFAULT_FILTER", () => {
      const { result } = renderHookWithCosts();
      expect(result.current.multiSelectCostValue).toEqual([]);
    });

    it("multiSelectCostValue reflects active selection", () => {
      mockStore.selectedCosts = ["3", "5"];
      const { result } = renderHookWithCosts();
      expect(result.current.multiSelectCostValue).toEqual(["3", "5"]);
    });

    it("multiSelectMapTypeValue is [] when selectedMapTypes is DEFAULT_FILTER", () => {
      const { result } = renderHookWithCosts();
      expect(result.current.multiSelectMapTypeValue).toEqual([]);
    });

    it("multiSelectMapTypeValue reflects active selection", () => {
      mockStore.selectedMapTypes = ["ruins"];
      const { result } = renderHookWithCosts();
      expect(result.current.multiSelectMapTypeValue).toEqual(["ruins"]);
    });
  });

  describe("options", () => {
    it("typeOptions has three groups: units, helpers, layout", () => {
      const { result } = renderHookWithCosts();
      expect(result.current.typeOptions).toHaveLength(3);
      expect(result.current.typeOptions[0]?.heading).toBe("units");
      expect(result.current.typeOptions[1]?.heading).toBe("helpers");
      expect(result.current.typeOptions[2]?.heading).toBe("layout");
    });

    it("units group contains all unit types", () => {
      const { result } = renderHookWithCosts();
      const unitValues = result.current.typeOptions[0]?.options.map((o) => o.value);
      expect(unitValues).toContain(CARD_TYPES.HERO);
      expect(unitValues).toContain(CARD_TYPES.MONSTER);
      expect(unitValues).toContain(CARD_TYPES.GOD);
      expect(unitValues).toContain(CARD_TYPES.TITAN);
      expect(unitValues).toContain(CARD_TYPES.TROOP);
    });

    it("helpers group contains art_of_war and troop_attachment", () => {
      const { result } = renderHookWithCosts();
      const helperValues = result.current.typeOptions[1]?.options.map((o) => o.value);
      expect(helperValues).toContain(CARD_TYPES.ART_OF_WAR);
      expect(helperValues).toContain(CARD_TYPES.TROOP_ATTACHMENT);
    });

    it("layout group contains maps option", () => {
      const { result } = renderHookWithCosts();
      const layoutValues = result.current.typeOptions[2]?.options.map((o) => o.value);
      expect(layoutValues).toContain(MAPS_FILTER_VALUE);
    });

    it("costOptions matches uniqueCosts", () => {
      const { result } = renderHookWithCosts([2, 4, 6]);
      expect(result.current.costOptions).toEqual([
        { value: "2", label: "2" },
        { value: "4", label: "4" },
        { value: "6", label: "6" },
      ]);
    });

    it("mapTypeOptions contains all MAP_TYPE values", () => {
      const { result } = renderHookWithCosts();
      const mapValues = result.current.mapTypeOptions.map((o) => o.value);
      Object.values(MAP_TYPE).forEach((type) => {
        expect(mapValues).toContain(type);
      });
    });
  });

  describe("handleTypeChange", () => {
    it("sets types to value when a non-map card type is selected", () => {
      const { result } = renderHookWithCosts();
      act(() => result.current.handleTypeChange([CARD_TYPES.GOD]));
      expect(mockStore.setSelectedTypes).toHaveBeenCalledWith([CARD_TYPES.GOD]);
    });

    it("resets to DEFAULT_FILTER when empty array passed", () => {
      const { result } = renderHookWithCosts();
      act(() => result.current.handleTypeChange([]));
      expect(mockStore.setSelectedTypes).toHaveBeenCalledWith([DEFAULT_FILTER]);
    });

    it("clears cost filter when maps is selected for the first time", () => {
      mockStore.selectedCosts = ["5"];
      const { result } = renderHookWithCosts();
      act(() => result.current.handleTypeChange([MAPS_FILTER_VALUE]));
      expect(mockStore.setSelectedCosts).toHaveBeenCalledWith([DEFAULT_FILTER]);
    });

    it("sets selectedTypes to [maps] when maps is selected", () => {
      const { result } = renderHookWithCosts();
      act(() => result.current.handleTypeChange([MAPS_FILTER_VALUE]));
      expect(mockStore.setSelectedTypes).toHaveBeenCalledWith([MAPS_FILTER_VALUE]);
    });

    it("does not touch cost filter when maps was already selected", () => {
      mockStore.selectedTypes = [MAPS_FILTER_VALUE];
      const { result } = renderHookWithCosts();
      act(() => result.current.handleTypeChange([MAPS_FILTER_VALUE, CARD_TYPES.GOD]));
      expect(mockStore.setSelectedCosts).not.toHaveBeenCalled();
    });

    it("resets types and map types when maps is deselected", () => {
      mockStore.selectedTypes = [MAPS_FILTER_VALUE];
      mockStore.selectedMapTypes = ["ruins"];
      const { result } = renderHookWithCosts();
      act(() => result.current.handleTypeChange([CARD_TYPES.GOD]));
      expect(mockStore.setSelectedMapTypes).toHaveBeenCalledWith([DEFAULT_FILTER]);
      expect(mockStore.setSelectedTypes).toHaveBeenCalledWith([DEFAULT_FILTER]);
    });

    it("does not call setSelectedCosts when maps is deselected", () => {
      mockStore.selectedTypes = [MAPS_FILTER_VALUE];
      const { result } = renderHookWithCosts();
      act(() => result.current.handleTypeChange([CARD_TYPES.GOD]));
      expect(mockStore.setSelectedCosts).not.toHaveBeenCalled();
    });
  });

  describe("handleCostChange", () => {
    it("sets costs to selected values", () => {
      const { result } = renderHookWithCosts([3, 4, 5]);
      act(() => result.current.handleCostChange(["3"]));
      expect(mockStore.setSelectedCosts).toHaveBeenCalledWith(["3"]);
    });

    it("resets to DEFAULT_FILTER when empty array passed", () => {
      const { result } = renderHookWithCosts([3, 4, 5]);
      act(() => result.current.handleCostChange([]));
      expect(mockStore.setSelectedCosts).toHaveBeenCalledWith([DEFAULT_FILTER]);
    });

    it("resets to DEFAULT_FILTER when all costs are selected", () => {
      const { result } = renderHookWithCosts([3, 4, 5]);
      act(() => result.current.handleCostChange(["3", "4", "5"]));
      expect(mockStore.setSelectedCosts).toHaveBeenCalledWith([DEFAULT_FILTER]);
    });
  });

  describe("handleMapTypeChange", () => {
    it("sets map types to selected values", () => {
      const { result } = renderHookWithCosts();
      act(() => result.current.handleMapTypeChange(["ruins"]));
      expect(mockStore.setSelectedMapTypes).toHaveBeenCalledWith(["ruins"]);
    });

    it("resets to DEFAULT_FILTER when empty array passed", () => {
      const { result } = renderHookWithCosts();
      act(() => result.current.handleMapTypeChange([]));
      expect(mockStore.setSelectedMapTypes).toHaveBeenCalledWith([DEFAULT_FILTER]);
    });

    it("resets to DEFAULT_FILTER when all map types are selected", () => {
      const { result } = renderHookWithCosts();
      const allMapTypes = Object.values(MAP_TYPE);
      act(() => result.current.handleMapTypeChange(allMapTypes));
      expect(mockStore.setSelectedMapTypes).toHaveBeenCalledWith([DEFAULT_FILTER]);
    });
  });
});
