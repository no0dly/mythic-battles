import { useMemo, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import debounce from "debounce";
import {
  useSearchName,
  useSelectedTypes,
  useSelectedCosts,
  useSelectedMapTypes,
  useFilterActions,
  DEFAULT_FILTER,
} from "@/stores/cardFilters";
import { CARD_TYPES, MAP_TYPE, UNIT_TYPES, HELPER_TYPES } from "@/types/constants";
import { MAPS_FILTER_VALUE } from "@/app/wiki/components/CardGallery/utils";
import type { MultiSelectGroup } from "@/components/ui/multi-select";

const ALL_FILTER_OPTIONS_COUNT = Object.values(CARD_TYPES).length + 1; // +1 for maps
const ALL_MAP_TYPE_COUNT = Object.values(MAP_TYPE).length;

export function useCardGalleryFilter(uniqueCosts: number[]) {
  const { t } = useTranslation();
  const searchName = useSearchName();
  const selectedTypes = useSelectedTypes();
  const selectedCosts = useSelectedCosts();
  const selectedMapTypes = useSelectedMapTypes();

  const {
    setSearchName,
    setSelectedTypes,
    setSelectedCosts,
    setSelectedMapTypes,
    clearFilters,
  } = useFilterActions();

  const mapsSelected = selectedTypes.includes(MAPS_FILTER_VALUE);

  const hasActiveFilters =
    !!searchName ||
    !selectedTypes.includes(DEFAULT_FILTER) ||
    !selectedCosts.includes(DEFAULT_FILTER) ||
    !selectedMapTypes.includes(DEFAULT_FILTER);

  const onInputChangeHandler = useMemo(
    () =>
      debounce((e: ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value);
      }, 400),
    [setSearchName],
  );

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
      {
        heading: t("layout"),
        options: [{ value: MAPS_FILTER_VALUE, label: t("maps") }],
      },
    ],
    [t],
  );

  const costOptions = useMemo(
    () => uniqueCosts.map((cost) => ({ value: String(cost), label: String(cost) })),
    [uniqueCosts],
  );

  const mapTypeOptions = useMemo(
    () => Object.values(MAP_TYPE).map((type) => ({ value: type, label: t(`mapTypeTitles.${type}`) })),
    [t],
  );

  const multiSelectTypeValue = selectedTypes.includes(DEFAULT_FILTER) ? [] : selectedTypes;
  const multiSelectCostValue = selectedCosts.includes(DEFAULT_FILTER) ? [] : selectedCosts;
  const multiSelectMapTypeValue = selectedMapTypes.includes(DEFAULT_FILTER) ? [] : selectedMapTypes;

  const handleTypeChange = (values: string[]) => {
    const hasMaps = values.includes(MAPS_FILTER_VALUE);
    const prevHadMaps = selectedTypes.includes(MAPS_FILTER_VALUE);

    if (hasMaps && !prevHadMaps) {
      setSelectedCosts([DEFAULT_FILTER]);
    } else if (!hasMaps && prevHadMaps) {
      setSelectedMapTypes([DEFAULT_FILTER]);
      setSelectedTypes([DEFAULT_FILTER]);
      return;
    }

    if (values.length === 0 || values.length === ALL_FILTER_OPTIONS_COUNT) {
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

  const handleMapTypeChange = (values: string[]) => {
    if (values.length === 0 || values.length === ALL_MAP_TYPE_COUNT) {
      setSelectedMapTypes([DEFAULT_FILTER]);
    } else {
      setSelectedMapTypes(values);
    }
  };

  return {
    mapsSelected,
    hasActiveFilters,
    onInputChangeHandler,
    typeOptions,
    costOptions,
    mapTypeOptions,
    multiSelectTypeValue,
    multiSelectCostValue,
    multiSelectMapTypeValue,
    handleTypeChange,
    handleCostChange,
    handleMapTypeChange,
    clearFilters,
  };
}
