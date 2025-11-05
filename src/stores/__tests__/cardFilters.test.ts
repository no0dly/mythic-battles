import { describe, it, expect, beforeEach } from "vitest";
import { useCardFiltersStoreBase } from "../cardFilters";
import { DEFAULT_FILTER } from "../cardFilters";
import { CARD_TYPES } from "@/types/database.types";

describe("cardFilters store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useCardFiltersStoreBase.setState({
      searchName: "",
      selectedType: DEFAULT_FILTER,
      selectedCost: DEFAULT_FILTER,
    });
  });

  describe("initial state", () => {
    it("should have empty searchName by default", () => {
      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
    });

    it("should have DEFAULT_FILTER for selectedType by default", () => {
      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedType).toBe(DEFAULT_FILTER);
    });

    it("should have DEFAULT_FILTER for selectedCost by default", () => {
      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedCost).toBe(DEFAULT_FILTER);
    });
  });

  describe("setSearchName", () => {
    it("should update searchName", () => {
      const { setSearchName } = useCardFiltersStoreBase.getState();
      setSearchName("zeus");

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("zeus");
    });

    it("should update searchName multiple times", () => {
      const { setSearchName } = useCardFiltersStoreBase.getState();
      setSearchName("zeus");
      setSearchName("ares");
      setSearchName("athena");

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("athena");
    });

    it("should handle empty string", () => {
      const { setSearchName } = useCardFiltersStoreBase.getState();
      setSearchName("zeus");
      setSearchName("");

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
    });

    it("should handle special characters", () => {
      const { setSearchName } = useCardFiltersStoreBase.getState();
      setSearchName("test-123_@#$");

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("test-123_@#$");
    });
  });

  describe("setSelectedType", () => {
    it("should update selectedType", () => {
      const { setSelectedType } = useCardFiltersStoreBase.getState();
      setSelectedType(CARD_TYPES.GOD);

      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedType).toBe(CARD_TYPES.GOD);
    });

    it("should update selectedType to different values", () => {
      const { setSelectedType } = useCardFiltersStoreBase.getState();
      setSelectedType(CARD_TYPES.GOD);
      setSelectedType(CARD_TYPES.HERO);
      setSelectedType(CARD_TYPES.MONSTER);

      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedType).toBe(CARD_TYPES.MONSTER);
    });

    it("should reset to DEFAULT_FILTER", () => {
      const { setSelectedType } = useCardFiltersStoreBase.getState();
      setSelectedType(CARD_TYPES.GOD);
      setSelectedType(DEFAULT_FILTER);

      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedType).toBe(DEFAULT_FILTER);
    });

    it("should handle all card types", () => {
      const { setSelectedType } = useCardFiltersStoreBase.getState();
      
      Object.values(CARD_TYPES).forEach((type) => {
        setSelectedType(type);
        const state = useCardFiltersStoreBase.getState();
        expect(state.selectedType).toBe(type);
      });
    });
  });

  describe("setSelectedCost", () => {
    it("should update selectedCost", () => {
      const { setSelectedCost } = useCardFiltersStoreBase.getState();
      setSelectedCost("5");

      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedCost).toBe("5");
    });

    it("should update selectedCost to different values", () => {
      const { setSelectedCost } = useCardFiltersStoreBase.getState();
      setSelectedCost("3");
      setSelectedCost("4");
      setSelectedCost("5");

      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedCost).toBe("5");
    });

    it("should reset to DEFAULT_FILTER", () => {
      const { setSelectedCost } = useCardFiltersStoreBase.getState();
      setSelectedCost("5");
      setSelectedCost(DEFAULT_FILTER);

      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedCost).toBe(DEFAULT_FILTER);
    });

    it("should handle cost as string", () => {
      const { setSelectedCost } = useCardFiltersStoreBase.getState();
      setSelectedCost("10");

      const state = useCardFiltersStoreBase.getState();
      expect(state.selectedCost).toBe("10");
    });
  });

  describe("clearFilters", () => {
    it("should reset all filters to default values", () => {
      const { setSearchName, setSelectedType, setSelectedCost, clearFilters } =
        useCardFiltersStoreBase.getState();

      // Set all filters
      setSearchName("zeus");
      setSelectedType(CARD_TYPES.GOD);
      setSelectedCost("5");

      // Clear all filters
      clearFilters();

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
      expect(state.selectedType).toBe(DEFAULT_FILTER);
      expect(state.selectedCost).toBe(DEFAULT_FILTER);
    });

    it("should work when only some filters are set", () => {
      const { setSearchName, clearFilters } = useCardFiltersStoreBase.getState();

      setSearchName("zeus");
      clearFilters();

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
      expect(state.selectedType).toBe(DEFAULT_FILTER);
      expect(state.selectedCost).toBe(DEFAULT_FILTER);
    });

    it("should work when no filters are set", () => {
      const { clearFilters } = useCardFiltersStoreBase.getState();

      clearFilters();

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
      expect(state.selectedType).toBe(DEFAULT_FILTER);
      expect(state.selectedCost).toBe(DEFAULT_FILTER);
    });
  });

  describe("multiple actions", () => {
    it("should handle multiple filter changes independently", () => {
      const {
        setSearchName,
        setSelectedType,
        setSelectedCost,
      } = useCardFiltersStoreBase.getState();

      setSearchName("zeus");
      setSelectedType(CARD_TYPES.HERO);
      setSelectedCost("3");

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("zeus");
      expect(state.selectedType).toBe(CARD_TYPES.HERO);
      expect(state.selectedCost).toBe("3");
    });

    it("should allow clearing after multiple changes", () => {
      const {
        setSearchName,
        setSelectedType,
        setSelectedCost,
        clearFilters,
      } = useCardFiltersStoreBase.getState();

      setSearchName("ares");
      setSelectedType(CARD_TYPES.MONSTER);
      setSelectedCost("4");
      clearFilters();

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
      expect(state.selectedType).toBe(DEFAULT_FILTER);
      expect(state.selectedCost).toBe(DEFAULT_FILTER);
    });
  });
});

