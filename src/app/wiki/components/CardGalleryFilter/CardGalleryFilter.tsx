"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { useTranslation } from "react-i18next";
import { useCardGalleryFilter } from "./hooks/useCardGalleryFilter";
import type { CardOrigin } from "@/types/database.types";

interface CardGalleryFilterProps {
  uniqueCosts: number[];
  uniqueOrigins: CardOrigin[];
}

export default function CardGalleryFilter({ uniqueCosts, uniqueOrigins }: CardGalleryFilterProps) {
  const { t } = useTranslation();
  const {
    mapsSelected,
    hasActiveFilters,
    onInputChangeHandler,
    typeOptions,
    costOptions,
    mapTypeOptions,
    originOptions,
    multiSelectTypeValue,
    multiSelectCostValue,
    multiSelectMapTypeValue,
    multiSelectOriginValue,
    handleTypeChange,
    handleCostChange,
    handleMapTypeChange,
    handleOriginChange,
    clearFilters,
  } = useCardGalleryFilter(uniqueCosts, uniqueOrigins);

  return (
    <UICard className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 w-full sm:w-auto space-y-2 max-w-xs">
          <Label htmlFor="search-name">{t("searchByName")}</Label>
          <Input id="search-name" type="text" onChange={onInputChangeHandler} />
        </div>

        <div className="w-full sm:w-80 space-y-2">
          <Label>{t("type")}</Label>
          <MultiSelect
            options={typeOptions}
            value={multiSelectTypeValue}
            onValueChange={handleTypeChange}
            placeholder={t("allTypes")}
          />
        </div>

        {mapsSelected ? (
          <div className="w-full sm:w-80 space-y-2">
            <Label>{t("mapType")}</Label>
            <MultiSelect
              options={mapTypeOptions}
              value={multiSelectMapTypeValue}
              onValueChange={handleMapTypeChange}
              placeholder={t("allMapTypes")}
            />
          </div>
        ) : (
          <div className="w-full sm:w-60 space-y-2">
            <Label>{t("cost")}</Label>
            <MultiSelect
              options={costOptions}
              value={multiSelectCostValue}
              onValueChange={handleCostChange}
              placeholder={t("allCosts")}
            />
          </div>
        )}

        <div className="w-full sm:w-72 space-y-2">
          <Label>{t("origin")}</Label>
          <MultiSelect
            options={originOptions}
            value={multiSelectOriginValue}
            onValueChange={handleOriginChange}
            placeholder={t("allOrigins")}
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
