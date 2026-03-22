import type { Card, GameMap } from "@/types/database.types";
import { DEFAULT_FILTER } from "@/stores/cardFilters";

export const GALLERY_KIND = {
  CARD: "card",
  MAP: "map",
} as const;

export const MAPS_FILTER_VALUE = "maps";

export type GalleryItem =
  | { kind: typeof GALLERY_KIND.CARD; data: Card }
  | { kind: typeof GALLERY_KIND.MAP; data: GameMap };

export const getFilteredData = (
  data: Card[],
  searchName: string,
  selectedTypes: string[],
  selectedCosts: string[]
): Card[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const hasTypeFilter = !selectedTypes.includes(DEFAULT_FILTER) && selectedTypes.length > 0;
  const hasCostFilter = !selectedCosts.includes(DEFAULT_FILTER) && selectedCosts.length > 0;

  const hasFilters = searchName || hasTypeFilter || hasCostFilter;

  if (!hasFilters) {
    return data;
  }

  const normalizedSearchName = searchName?.toLowerCase().trim();

  return data.filter((card) => {
    if (normalizedSearchName) {
      if (!card.unit_name.toLowerCase().includes(normalizedSearchName)) {
        return false;
      }
    }

    // Exclude the virtual "maps" value before checking card types
    const cardTypes = selectedTypes.filter((t) => t !== MAPS_FILTER_VALUE);
    if (hasTypeFilter && cardTypes.length === 0) {
      // Only "maps" is selected — hide all cards
      return false;
    }
    if (hasTypeFilter && cardTypes.length > 0 && !cardTypes.includes(card.unit_type)) {
      return false;
    }

    if (hasCostFilter && !selectedCosts.includes(card.cost.toString())) {
      return false;
    }

    return true;
  });
};

export const getFilteredMaps = (
  maps: GameMap[],
  searchName: string,
  selectedTypes: string[],
  selectedCosts: string[],
  selectedMapTypes: string[],
): GameMap[] => {
  if (!maps || maps.length === 0) {
    return [];
  }

  // Hide maps when cost filter is active (maps have no cost)
  const hasCostFilter = !selectedCosts.includes(DEFAULT_FILTER) && selectedCosts.length > 0;
  if (hasCostFilter) {
    return [];
  }

  const isAllSelected = selectedTypes.includes(DEFAULT_FILTER);
  const hasMapsSelected = selectedTypes.includes(MAPS_FILTER_VALUE);

  // Show maps only when no filter is active or maps is explicitly selected
  if (!isAllSelected && !hasMapsSelected) {
    return [];
  }

  const hasMapTypeFilter = !selectedMapTypes.includes(DEFAULT_FILTER) && selectedMapTypes.length > 0;

  return maps.filter((map) => {
    if (searchName) {
      const normalized = searchName.toLowerCase().trim();
      if (!map.name.toLowerCase().includes(normalized)) return false;
    }

    if (hasMapTypeFilter) {
      const mapTypes = map.map_type ?? [];
      if (!mapTypes.some((t) => selectedMapTypes.includes(t))) return false;
    }

    return true;
  });
};

export const getUniqueCosts = (data: Card[]): number[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const uniqueCosts = new Set<number>();
  for (const card of data) {
    uniqueCosts.add(card.cost);
  }

  return Array.from(uniqueCosts).sort((a, b) => a - b);
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  if (!array || array.length === 0 || size <= 0) {
    return [];
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
