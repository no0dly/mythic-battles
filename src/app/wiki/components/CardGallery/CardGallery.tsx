"use client";

import { api } from "@/trpc/client";

import Loader from "@/components/Loader";
import CardGalleryModal from "../CardGalleryModal";
import CardGalleryItem from "../CardGalleryItem";
import CardGalleryFilter from "../CardGalleryFilter";
import { useState, useMemo } from "react";
import type { Card } from "@/types/database.types";
import {
  useSearchName,
  useSelectedType,
  useSelectedCost,
} from "@/stores/cardFilters";
import { getUniqueCosts, getFilteredData } from "./utils";
import { useTranslation } from "react-i18next";

export default function CardGallery() {
  const { t } = useTranslation();
  const { data, isLoading, error } = api.cards.list.useQuery();
  const [selected, setSelected] = useState<Card | null>(null);
  const searchName = useSearchName();
  const selectedType = useSelectedType();
  const selectedCost = useSelectedCost();

  const uniqueCosts = useMemo(() => getUniqueCosts(data || []), [data]);

  const filteredData = useMemo(
    () => getFilteredData(data || [], searchName, selectedType, selectedCost),
    [data, searchName, selectedType, selectedCost]
  );

  if (error) {
    return (
      <p className="text-red-600 dark:text-red-400">Failed to load cards.</p>
    );
  }

  const onCardClickHandler = (item: Card) => () => setSelected(item);
  const onCloseHandler = () => setSelected(null);

  return (
    <div className="h-full overflow-y-auto space-y-8">
      <CardGalleryFilter uniqueCosts={uniqueCosts} />

      {filteredData && (
        <p className="text-sm text-muted-foreground">
          {t("showingCards", {
            count: filteredData.length,
            total: data?.length || 0,
          })}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredData?.map((item) => (
          <CardGalleryItem
            key={item.id}
            item={item}
            onCardClickHandler={onCardClickHandler(item)}
          />
        ))}
      </div>

      {filteredData?.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground py-8">
          {t("noCardsFoundMatchingYourFilters")}
        </p>
      )}

      {!!selected && (
        <CardGalleryModal selected={selected} onCloseAction={onCloseHandler} />
      )}

      {isLoading && <Loader />}
    </div>
  );
}
