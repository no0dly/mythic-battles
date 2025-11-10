"use client";

import {
  useSelectedType,
  useSelectedCost,
  useFilterActions,
  DEFAULT_FILTER,
} from "@/stores/cardFilters";
import { CARD_TYPES } from "@/types/constants";
import { Button } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface DraftCardFilterProps {
  uniqueCosts: number[];
}

export function DraftCardFilter({
  uniqueCosts,
}: DraftCardFilterProps) {
  const { t } = useTranslation();
  const selectedType = useSelectedType();
  const selectedCost = useSelectedCost();

  const { setSelectedType, setSelectedCost, clearFilters } =
    useFilterActions();

  const hasActiveFilters =
    selectedType !== DEFAULT_FILTER ||
    selectedCost !== DEFAULT_FILTER;

  return (
    <UICard className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger id="filter-type" className="w-full">
              <SelectValue placeholder={t("allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_FILTER}>{t("allTypes")}</SelectItem>
              {Object.values(CARD_TYPES).map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`cardType.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-32">
          <Select value={selectedCost} onValueChange={setSelectedCost}>
            <SelectTrigger id="filter-cost" className="w-full">
              <SelectValue placeholder={t("allCosts")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_FILTER}>{t("allCosts")}</SelectItem>
              {uniqueCosts.map((cost) => (
                <SelectItem key={cost} value={String(cost)}>
                  {cost}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

