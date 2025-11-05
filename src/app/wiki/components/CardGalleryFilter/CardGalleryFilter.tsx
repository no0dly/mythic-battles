"use client";
import {
  useSearchName,
  useSelectedType,
  useSelectedCost,
  useFilterActions,
  DEFAULT_FILTER,
} from "@/stores/cardFilters";
import { CARD_TYPES } from "@/types/database.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import debounce from "debounce";

interface CardGalleryFilterProps {
  uniqueCosts: number[];
}

export default function CardGalleryFilter({
  uniqueCosts,
}: CardGalleryFilterProps) {
  const { t } = useTranslation();
  const searchName = useSearchName();
  const selectedType = useSelectedType();
  const selectedCost = useSelectedCost();
  const { setSearchName, setSelectedType, setSelectedCost, clearFilters } =
    useFilterActions();

  const hasActiveFilters =
    !!searchName ||
    selectedType !== DEFAULT_FILTER ||
    selectedCost !== DEFAULT_FILTER;

  const onInputChangeHandler = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchName(e.target.value);
    },
    400
  );

  return (
    <UICard className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full sm:w-auto space-y-2 max-w-xs">
          <Label htmlFor="search-name">{t("searchByName")}</Label>
          <Input id="search-name" type="text" onChange={onInputChangeHandler} />
        </div>

        <div className="w-full sm:w-48 space-y-2">
          <Label htmlFor="filter-type">{t("type")}</Label>
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

        <div className="w-full sm:w-32 space-y-2">
          <Label htmlFor="filter-cost">{t("cost")}</Label>
          <Select value={selectedCost} onValueChange={setSelectedCost}>
            <SelectTrigger id="filter-cost" className="w-full">
              <SelectValue placeholder={t("allCosts")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_FILTER}>{t("allCosts")}</SelectItem>
              {uniqueCosts.map((cost) => (
                <SelectItem key={cost} value={cost?.toString() ?? ""}>
                  {cost}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline" size="default">
            {t("clearFilters")}
          </Button>
        )}
      </div>
    </UICard>
  );
}
