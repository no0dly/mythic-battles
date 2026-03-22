import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface CardFiltersState {
  searchName: string;
  selectedTypes: string[];
  selectedCosts: string[];
  selectedMapTypes: string[];
}

interface CardFiltersActions {
  setSearchName: (value: string) => void;
  setSelectedTypes: (value: string[]) => void;
  setSelectedCosts: (value: string[]) => void;
  setSelectedMapTypes: (value: string[]) => void;
  clearFilters: () => void;
}

type CardFiltersStore = CardFiltersState & CardFiltersActions;

export const DEFAULT_FILTER = "all"

export const useCardFiltersStoreBase = create<CardFiltersStore>((set) => ({
  searchName: "",
  selectedTypes: [DEFAULT_FILTER],
  selectedCosts: [DEFAULT_FILTER],
  selectedMapTypes: [DEFAULT_FILTER],
  setSearchName: (value) => set({ searchName: value }),
  setSelectedTypes: (value) => set({ selectedTypes: value }),
  setSelectedCosts: (value) => set({ selectedCosts: value }),
  setSelectedMapTypes: (value) => set({ selectedMapTypes: value }),
  clearFilters: () =>
    set({
      searchName: "",
      selectedTypes: [DEFAULT_FILTER],
      selectedCosts: [DEFAULT_FILTER],
      selectedMapTypes: [DEFAULT_FILTER],
    }),
}));

export const useCardFiltersStore = <T,>(
  selector: (state: CardFiltersStore) => T
) => useCardFiltersStoreBase(selector);

export const useSearchName = () =>
  useCardFiltersStore((state) => state.searchName);
export const useSelectedTypes = () =>
  useCardFiltersStore((state) => state.selectedTypes);
export const useSelectedCosts = () =>
  useCardFiltersStore((state) => state.selectedCosts);
export const useSelectedMapTypes = () =>
  useCardFiltersStore((state) => state.selectedMapTypes);

export const useFilterActions = () =>
  useCardFiltersStoreBase(
    useShallow((state) => ({
      setSearchName: state.setSearchName,
      setSelectedTypes: state.setSelectedTypes,
      setSelectedCosts: state.setSelectedCosts,
      setSelectedMapTypes: state.setSelectedMapTypes,
      clearFilters: state.clearFilters,
    }))
  );

export const useFilterValues = () =>
  useCardFiltersStoreBase(
    useShallow((state) => ({
      searchName: state.searchName,
      selectedTypes: state.selectedTypes,
      selectedCosts: state.selectedCosts,
      selectedMapTypes: state.selectedMapTypes,
    }))
  );
