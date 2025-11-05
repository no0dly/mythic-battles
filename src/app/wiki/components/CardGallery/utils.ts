import { Card } from "@/types/database.types";
import { DEFAULT_FILTER } from "@/stores/cardFilters";

export const getFilteredData = (data: Card[], searchName: string, selectedType: string, selectedCost: string) => {
  return data.filter((card) => {
    if (searchName && !card.unit_name.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }
    if (selectedType !== DEFAULT_FILTER && card.unit_type !== selectedType) {
      return false;
    }
    if (selectedCost !== DEFAULT_FILTER && card.cost.toString() !== selectedCost) {
      return false;
    }
    return true;
  });
}

export const getUniqueCosts = (data: Card[]) => {
  return [...new Set(data.map((card) => card.cost))].sort((a, b) => a - b);
}