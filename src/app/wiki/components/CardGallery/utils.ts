import { Card } from "@/types/database.types";
import { DEFAULT_FILTER } from "@/stores/cardFilters";

/**
 * Filters cards based on search name, type, and cost
 * Optimized with early returns for better performance
 */
export const getFilteredData = (
  data: Card[],
  searchName: string,
  selectedType: string,
  selectedCost: string
): Card[] => {
  if (!data || data.length === 0) {
    return [];
  }

  // Early return if no filters are applied
  const hasFilters =
    searchName ||
    selectedType !== DEFAULT_FILTER ||
    selectedCost !== DEFAULT_FILTER;

  if (!hasFilters) {
    return data;
  }

  // Normalize search name once
  const normalizedSearchName = searchName?.toLowerCase().trim();

  return data.filter((card) => {
    // Filter by search name
    if (normalizedSearchName) {
      const cardName = card.unit_name.toLowerCase();
      if (!cardName.includes(normalizedSearchName)) {
        return false;
      }
    }

    // Filter by type
    if (selectedType !== DEFAULT_FILTER && card.unit_type !== selectedType) {
      return false;
    }

    // Filter by cost
    if (selectedCost !== DEFAULT_FILTER) {
      const cardCost = card.cost.toString();
      if (cardCost !== selectedCost) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Gets unique costs from card data, sorted ascending
 */
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

/**
 * Splits an array into chunks of specified size
 */
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