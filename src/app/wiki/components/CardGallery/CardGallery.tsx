"use client";

import { api } from "@/trpc/client";

import Loader from "@/components/Loader";
import CardGalleryItem from "../CardGalleryItem";
import CardGalleryFilter from "../CardGalleryFilter";
import { useMemo, useRef } from "react";
import {
  useSearchName,
  useSelectedType,
  useSelectedCost,
} from "@/stores/cardFilters";
import { getUniqueCosts, getFilteredData } from "./utils";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import useResponsiveColumns from "./hooks/useResponsiveColumns";
import { chunk } from "./utils";
import styles from "./CardGallery.module.css";

const ROW_HEIGHT_ESTIMATE = 350;
const OVERSCAN = 5;

export default function CardGallery() {
  const { t } = useTranslation();
  const { data, isLoading, error } = api.cards.list.useQuery();
  const searchName = useSearchName();
  const selectedType = useSelectedType();
  const selectedCost = useSelectedCost();
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useResponsiveColumns();

  const uniqueCosts = useMemo(() => getUniqueCosts(data || []), [data]);

  const filteredData = useMemo(
    () => getFilteredData(data || [], searchName, selectedType, selectedCost),
    [data, searchName, selectedType, selectedCost]
  );

  const rows = useMemo(
    () => (filteredData ? chunk(filteredData, Math.max(columns, 1)) : []),
    [filteredData, columns]
  );

  // Note: React Compiler will show a warning here because TanStack Virtual returns functions
  // that cannot be memoized. This is expected and safe - the compiler correctly skips
  // memoization for this hook, which is the intended behavior for this library.
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: OVERSCAN,
  });

  // Get virtual items, with fallback to render first few rows if virtualizer hasn't initialized yet
  // This ensures cards are visible even when the container doesn't have a height yet
  const virtualItems = virtualizer.getVirtualItems();
  const itemsToRender =
    virtualItems.length > 0
      ? virtualItems
      : rows.length > 0
      ? rows.slice(0, Math.min(3, rows.length)).map((_, index) => ({
          key: String(index),
          index,
          start: index * ROW_HEIGHT_ESTIMATE,
          size: ROW_HEIGHT_ESTIMATE,
        }))
      : [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 dark:text-red-400">
          {t("errorLoadingCards")}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-background flex flex-col gap-2 mb-1">
        <CardGalleryFilter uniqueCosts={uniqueCosts} />

        {filteredData && (
          <p className="text-sm text-muted-foreground py-2">
            {t("showingCards", {
              count: filteredData.length,
              total: data?.length || 0,
            })}
          </p>
        )}
      </div>

      <div
        ref={parentRef}
        className={`flex-1 overflow-y-auto ${styles.scrollContainer}`}
      >
        {filteredData?.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-muted-foreground py-8">
              {t("noCardsFoundMatchingYourFilters")}
            </p>
          </div>
        ) : (
          <div
            style={{
              height: `${Math.max(
                virtualizer.getTotalSize(),
                itemsToRender.length > 0
                  ? itemsToRender.length * ROW_HEIGHT_ESTIMATE
                  : ROW_HEIGHT_ESTIMATE
              )}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {itemsToRender.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {row.map((item) => (
                      <CardGalleryItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isLoading && <Loader />}
    </div>
  );
}
