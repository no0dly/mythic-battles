import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface CardFiltersState {
  searchName: string;
  selectedType: string;
  selectedCost: string;
}

interface CardFiltersActions {
  setSearchName: (value: string) => void;
  setSelectedType: (value: string) => void;
  setSelectedCost: (value: string) => void;
  clearFilters: () => void;
}

type CardFiltersStore = CardFiltersState & CardFiltersActions;

export const DEFAULT_FILTER = "all"

export const useCardFiltersStoreBase = create<CardFiltersStore>((set) => ({
  searchName: "",
  selectedType: DEFAULT_FILTER,
  selectedCost: DEFAULT_FILTER,
  setSearchName: (value) => set({ searchName: value }),
  setSelectedType: (value) => set({ selectedType: value }),
  setSelectedCost: (value) => set({ selectedCost: value }),
  clearFilters: () =>
    set({
      searchName: "",
      selectedType: DEFAULT_FILTER,
      selectedCost: DEFAULT_FILTER,
    }),
}));

export const useCardFiltersStore = <T,>(
  selector: (state: CardFiltersStore) => T
) => useCardFiltersStoreBase(selector);

export const useSearchName = () =>
  useCardFiltersStore((state) => state.searchName);
export const useSelectedType = () =>
  useCardFiltersStore((state) => state.selectedType);
export const useSelectedCost = () =>
  useCardFiltersStore((state) => state.selectedCost);

export const useFilterActions = () =>
  useCardFiltersStoreBase(
    useShallow((state) => ({
      setSearchName: state.setSearchName,
      setSelectedType: state.setSelectedType,
      setSelectedCost: state.setSelectedCost,
      clearFilters: state.clearFilters,
    }))
  );

export const useFilterValues = () =>
  useCardFiltersStoreBase(
    useShallow((state) => ({
      searchName: state.searchName,
      selectedType: state.selectedType,
      selectedCost: state.selectedCost,
    }))
  );

