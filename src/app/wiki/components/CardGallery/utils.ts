import type { Card, CardOrigin, GameMap } from "@/types/database.types";
import { DEFAULT_FILTER } from "@/stores/cardFilters";
import { CARD_ORIGIN_FULL_NAME } from "@/types/constants";

export const GALLERY_KIND = {
  CARD: "card",
  MAP: "map",
} as const;

export const MAPS_FILTER_VALUE = "maps";

export type GalleryItem =
  | { kind: typeof GALLERY_KIND.CARD; data: Card }
  | { kind: typeof GALLERY_KIND.MAP; data: GameMap };

const isOriginFilterActive = (selectedOrigins: string[]): boolean =>
  !selectedOrigins.includes(DEFAULT_FILTER) && selectedOrigins.length > 0;

export const getOriginLabel = (origin: CardOrigin): string =>
  CARD_ORIGIN_FULL_NAME[origin] ?? origin;

export const getFilteredData = (
  data: Card[],
  searchName: string,
  selectedTypes: string[],
  selectedCosts: string[],
  selectedOrigins: string[] = [DEFAULT_FILTER],
): Card[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const hasTypeFilter = !selectedTypes.includes(DEFAULT_FILTER) && selectedTypes.length > 0;
  const hasCostFilter = !selectedCosts.includes(DEFAULT_FILTER) && selectedCosts.length > 0;
  const hasOriginFilter = isOriginFilterActive(selectedOrigins);

  const hasFilters = searchName || hasTypeFilter || hasCostFilter || hasOriginFilter;

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

    if (hasOriginFilter && (!card.origin || !selectedOrigins.includes(card.origin))) {
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
  selectedOrigins: string[] = [DEFAULT_FILTER],
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
  const hasOriginFilter = isOriginFilterActive(selectedOrigins);

  return maps.filter((map) => {
    if (hasOriginFilter && !selectedOrigins.includes(map.origin)) return false;

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

export const getUniqueOrigins = (cards: Card[], maps: GameMap[]): CardOrigin[] => {
  const uniqueOrigins = new Set<CardOrigin>();
  for (const card of cards ?? []) {
    if (card.origin) uniqueOrigins.add(card.origin);
  }
  for (const map of maps ?? []) {
    if (map.origin) uniqueOrigins.add(map.origin);
  }

  return Array.from(uniqueOrigins).sort((a, b) =>
    getOriginLabel(a).localeCompare(getOriginLabel(b)),
  );
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
