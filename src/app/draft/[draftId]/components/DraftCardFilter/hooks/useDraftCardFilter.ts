import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useSelectedTypes,
  useSelectedCosts,
  useFilterActions,
  DEFAULT_FILTER,
} from "@/stores/cardFilters";
import { CARD_TYPES, UNIT_TYPES, HELPER_TYPES } from "@/types/constants";
import type { MultiSelectGroup } from "@/components/ui/multi-select";

const ALL_TYPE_OPTIONS_COUNT = Object.values(CARD_TYPES).length;

export function useDraftCardFilter(uniqueCosts: number[]) {
  const { t } = useTranslation();
  const selectedTypes = useSelectedTypes();
  const selectedCosts = useSelectedCosts();
  const { setSelectedTypes, setSelectedCosts, clearFilters } = useFilterActions();

  const hasActiveFilters =
    !selectedTypes.includes(DEFAULT_FILTER) ||
    !selectedCosts.includes(DEFAULT_FILTER);

  const typeOptions: MultiSelectGroup[] = useMemo(
    () => [
      {
        heading: t("units"),
        options: UNIT_TYPES.map((type) => ({ value: type, label: t(`cardType.${type}`) })),
      },
      {
        heading: t("helpers"),
        options: HELPER_TYPES.map((type) => ({ value: type, label: t(`cardType.${type}`) })),
      },
    ],
    [t],
  );

  const costOptions = useMemo(
    () => uniqueCosts.map((cost) => ({ value: String(cost), label: String(cost) })),
    [uniqueCosts],
  );

  const multiSelectTypeValue = selectedTypes.includes(DEFAULT_FILTER) ? [] : selectedTypes;
  const multiSelectCostValue = selectedCosts.includes(DEFAULT_FILTER) ? [] : selectedCosts;

  const handleTypeChange = (values: string[]) => {
    if (values.length === 0 || values.length === ALL_TYPE_OPTIONS_COUNT) {
      setSelectedTypes([DEFAULT_FILTER]);
    } else {
      setSelectedTypes(values);
    }
  };

  const handleCostChange = (values: string[]) => {
    if (values.length === 0 || values.length === uniqueCosts.length) {
      setSelectedCosts([DEFAULT_FILTER]);
    } else {
      setSelectedCosts(values);
    }
  };

  return {
    typeOptions,
    costOptions,
    multiSelectTypeValue,
    multiSelectCostValue,
    hasActiveFilters,
    handleTypeChange,
    handleCostChange,
    clearFilters,
  };
}
