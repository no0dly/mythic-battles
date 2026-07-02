"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ALL_VALUE } from "@/types/constants";
import { MapTypeMultiselectCombobox } from "./components/MapTypeMultiselectCombobox";
import { useMapTypeOptions } from "./hooks/useMapTypeOptions";
import { useMapTypeSelection } from "./hooks/useMapTypeSelection";
import type { MultiselectForMapTypeProps } from "./types";

export function MultiselectForMapType({
  value,
  onValueChange,
}: MultiselectForMapTypeProps) {
  const { t } = useTranslation();
  const mapTypeOptions = useMapTypeOptions();

  const { selected, isAllSelected, handleValueChange } = useMapTypeSelection({
    value,
    onValueChange,
    optionCount: mapTypeOptions.length,
  });

  const getLabel = useCallback(
    (item: string) => (item === ALL_VALUE ? t("all") : item),
    [t],
  );

  return (
    <MapTypeMultiselectCombobox
      options={mapTypeOptions}
      selected={selected}
      isAllSelected={isAllSelected}
      onValueChange={handleValueChange}
      getLabel={getLabel}
    />
  );
}

export default MultiselectForMapType;
