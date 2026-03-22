import { describe, it, expect, beforeEach } from "vitest";
import { useCardFiltersStoreBase, DEFAULT_FILTER } from "../cardFilters";
import { CARD_TYPES } from "@/types/constants";

describe("cardFilters store", () => {
  beforeEach(() => {
    useCardFiltersStoreBase.setState({
      searchName: "",
      selectedTypes: [DEFAULT_FILTER],
      selectedCosts: [DEFAULT_FILTER],
      selectedMapTypes: [DEFAULT_FILTER],
    });
  });

  describe("initial state", () => {
    it("has empty searchName by default", () => {
      expect(useCardFiltersStoreBase.getState().searchName).toBe("");
    });

    it("has [DEFAULT_FILTER] for selectedTypes by default", () => {
      expect(useCardFiltersStoreBase.getState().selectedTypes).toEqual([DEFAULT_FILTER]);
    });

    it("has [DEFAULT_FILTER] for selectedCosts by default", () => {
      expect(useCardFiltersStoreBase.getState().selectedCosts).toEqual([DEFAULT_FILTER]);
    });

    it("has [DEFAULT_FILTER] for selectedMapTypes by default", () => {
      expect(useCardFiltersStoreBase.getState().selectedMapTypes).toEqual([DEFAULT_FILTER]);
    });
  });

  describe("setSearchName", () => {
    it("updates searchName", () => {
      useCardFiltersStoreBase.getState().setSearchName("zeus");
      expect(useCardFiltersStoreBase.getState().searchName).toBe("zeus");
    });

    it("updates searchName multiple times, keeping last value", () => {
      const { setSearchName } = useCardFiltersStoreBase.getState();
      setSearchName("zeus");
      setSearchName("ares");
      setSearchName("athena");
      expect(useCardFiltersStoreBase.getState().searchName).toBe("athena");
    });

    it("handles empty string", () => {
      const { setSearchName } = useCardFiltersStoreBase.getState();
      setSearchName("zeus");
      setSearchName("");
      expect(useCardFiltersStoreBase.getState().searchName).toBe("");
    });

    it("handles special characters", () => {
      useCardFiltersStoreBase.getState().setSearchName("test-123_@#$");
      expect(useCardFiltersStoreBase.getState().searchName).toBe("test-123_@#$");
    });
  });

  describe("setSelectedTypes", () => {
    it("updates selectedTypes with a single type", () => {
      useCardFiltersStoreBase.getState().setSelectedTypes([CARD_TYPES.GOD]);
      expect(useCardFiltersStoreBase.getState().selectedTypes).toEqual([CARD_TYPES.GOD]);
    });

    it("updates selectedTypes with multiple types", () => {
      useCardFiltersStoreBase.getState().setSelectedTypes([CARD_TYPES.GOD, CARD_TYPES.HERO]);
      expect(useCardFiltersStoreBase.getState().selectedTypes).toEqual([CARD_TYPES.GOD, CARD_TYPES.HERO]);
    });

    it("resets to [DEFAULT_FILTER]", () => {
      const { setSelectedTypes } = useCardFiltersStoreBase.getState();
      setSelectedTypes([CARD_TYPES.GOD]);
      setSelectedTypes([DEFAULT_FILTER]);
      expect(useCardFiltersStoreBase.getState().selectedTypes).toEqual([DEFAULT_FILTER]);
    });

    it("handles all card types", () => {
      Object.values(CARD_TYPES).forEach((type) => {
        useCardFiltersStoreBase.getState().setSelectedTypes([type]);
        expect(useCardFiltersStoreBase.getState().selectedTypes).toEqual([type]);
      });
    });
  });

  describe("setSelectedCosts", () => {
    it("updates selectedCosts with a single cost", () => {
      useCardFiltersStoreBase.getState().setSelectedCosts(["5"]);
      expect(useCardFiltersStoreBase.getState().selectedCosts).toEqual(["5"]);
    });

    it("updates selectedCosts with multiple costs", () => {
      useCardFiltersStoreBase.getState().setSelectedCosts(["3", "5"]);
      expect(useCardFiltersStoreBase.getState().selectedCosts).toEqual(["3", "5"]);
    });

    it("resets to [DEFAULT_FILTER]", () => {
      const { setSelectedCosts } = useCardFiltersStoreBase.getState();
      setSelectedCosts(["5"]);
      setSelectedCosts([DEFAULT_FILTER]);
      expect(useCardFiltersStoreBase.getState().selectedCosts).toEqual([DEFAULT_FILTER]);
    });

    it("keeps last value when set multiple times", () => {
      const { setSelectedCosts } = useCardFiltersStoreBase.getState();
      setSelectedCosts(["3"]);
      setSelectedCosts(["4"]);
      setSelectedCosts(["5"]);
      expect(useCardFiltersStoreBase.getState().selectedCosts).toEqual(["5"]);
    });
  });

  describe("setSelectedMapTypes", () => {
    it("updates selectedMapTypes with a single map type", () => {
      useCardFiltersStoreBase.getState().setSelectedMapTypes(["ruins"]);
      expect(useCardFiltersStoreBase.getState().selectedMapTypes).toEqual(["ruins"]);
    });

    it("updates selectedMapTypes with multiple map types", () => {
      useCardFiltersStoreBase.getState().setSelectedMapTypes(["ruins", "forest"]);
      expect(useCardFiltersStoreBase.getState().selectedMapTypes).toEqual(["ruins", "forest"]);
    });

    it("resets to [DEFAULT_FILTER]", () => {
      const { setSelectedMapTypes } = useCardFiltersStoreBase.getState();
      setSelectedMapTypes(["ruins"]);
      setSelectedMapTypes([DEFAULT_FILTER]);
      expect(useCardFiltersStoreBase.getState().selectedMapTypes).toEqual([DEFAULT_FILTER]);
    });
  });

  describe("clearFilters", () => {
    it("resets all filters to default values", () => {
      const { setSearchName, setSelectedTypes, setSelectedCosts, setSelectedMapTypes, clearFilters } =
        useCardFiltersStoreBase.getState();

      setSearchName("zeus");
      setSelectedTypes([CARD_TYPES.GOD]);
      setSelectedCosts(["5"]);
      setSelectedMapTypes(["ruins"]);
      clearFilters();

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
      expect(state.selectedTypes).toEqual([DEFAULT_FILTER]);
      expect(state.selectedCosts).toEqual([DEFAULT_FILTER]);
      expect(state.selectedMapTypes).toEqual([DEFAULT_FILTER]);
    });

    it("works when only some filters are set", () => {
      const { setSearchName, clearFilters } = useCardFiltersStoreBase.getState();
      setSearchName("zeus");
      clearFilters();

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
      expect(state.selectedTypes).toEqual([DEFAULT_FILTER]);
      expect(state.selectedCosts).toEqual([DEFAULT_FILTER]);
      expect(state.selectedMapTypes).toEqual([DEFAULT_FILTER]);
    });

    it("works when no filters are set", () => {
      useCardFiltersStoreBase.getState().clearFilters();

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
      expect(state.selectedTypes).toEqual([DEFAULT_FILTER]);
      expect(state.selectedCosts).toEqual([DEFAULT_FILTER]);
      expect(state.selectedMapTypes).toEqual([DEFAULT_FILTER]);
    });
  });

  describe("multiple actions", () => {
    it("handles multiple filter changes independently", () => {
      const { setSearchName, setSelectedTypes, setSelectedCosts } =
        useCardFiltersStoreBase.getState();

      setSearchName("zeus");
      setSelectedTypes([CARD_TYPES.HERO]);
      setSelectedCosts(["3"]);

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("zeus");
      expect(state.selectedTypes).toEqual([CARD_TYPES.HERO]);
      expect(state.selectedCosts).toEqual(["3"]);
    });

    it("allows clearing after multiple changes", () => {
      const { setSearchName, setSelectedTypes, setSelectedCosts, setSelectedMapTypes, clearFilters } =
        useCardFiltersStoreBase.getState();

      setSearchName("ares");
      setSelectedTypes([CARD_TYPES.MONSTER]);
      setSelectedCosts(["4"]);
      setSelectedMapTypes(["forest"]);
      clearFilters();

      const state = useCardFiltersStoreBase.getState();
      expect(state.searchName).toBe("");
      expect(state.selectedTypes).toEqual([DEFAULT_FILTER]);
      expect(state.selectedCosts).toEqual([DEFAULT_FILTER]);
      expect(state.selectedMapTypes).toEqual([DEFAULT_FILTER]);
    });
  });
});
