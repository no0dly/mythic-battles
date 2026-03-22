"use client";

import { Button } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { useTranslation } from "react-i18next";
import { useDraftCardFilter } from "./hooks/useDraftCardFilter";

interface DraftCardFilterProps {
  uniqueCosts: number[];
}

export function DraftCardFilter({ uniqueCosts }: DraftCardFilterProps) {
  const { t } = useTranslation();
  const {
    typeOptions,
    costOptions,
    multiSelectTypeValue,
    multiSelectCostValue,
    hasActiveFilters,
    handleTypeChange,
    handleCostChange,
    clearFilters,
  } = useDraftCardFilter(uniqueCosts);

  return (
    <UICard className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-80">
          <MultiSelect
            options={typeOptions}
            value={multiSelectTypeValue}
            onValueChange={handleTypeChange}
            placeholder={t("allTypes")}
          />
        </div>

        <div className="w-full sm:w-60">
          <MultiSelect
            options={costOptions}
            value={multiSelectCostValue}
            onValueChange={handleCostChange}
            placeholder={t("allCosts")}
          />
        </div>

        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="outline"
            size="default"
            className="self-end"
          >
            {t("clearFilters")}
          </Button>
        )}
      </div>
    </UICard>
  );
}
