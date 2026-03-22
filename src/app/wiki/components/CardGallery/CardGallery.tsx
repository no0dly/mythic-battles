"use client";

import { api } from "@/trpc/client";

import Loader from "@/components/Loader";
import CardGalleryItem from "../CardGalleryItem";
import MapGalleryItem from "../MapGalleryItem/MapGalleryItem";
import CardGalleryFilter from "../CardGalleryFilter";
import { useMemo, useRef } from "react";
import {
  useSearchName,
  useSelectedTypes,
  useSelectedCosts,
  useSelectedMapTypes,
} from "@/stores/cardFilters";
import {
  getUniqueCosts,
  getFilteredData,
  getFilteredMaps,
  chunk,
  GALLERY_KIND,
} from "./utils";
import type { GalleryItem } from "./utils";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import useResponsiveColumns from "./hooks/useResponsiveColumns";
import styles from "./CardGallery.module.css";

const ROW_HEIGHT_ESTIMATE = 350;
const OVERSCAN = 5;

export default function CardGallery() {
  const { t } = useTranslation();
  const {
    data: cards,
    isLoading: cardsLoading,
    error: cardsError,
  } = api.cards.list.useQuery();
  const { data: maps, isLoading: mapsLoading } = api.maps.list.useQuery();
  const searchName = useSearchName();
  const selectedTypes = useSelectedTypes();
  const selectedCosts = useSelectedCosts();
  const selectedMapTypes = useSelectedMapTypes();
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useResponsiveColumns();

  const isLoading = cardsLoading || mapsLoading;

  const uniqueCosts = useMemo(() => getUniqueCosts(cards || []), [cards]);

  const filteredItems = useMemo<GalleryItem[]>(() => {
    const filteredCards = getFilteredData(
      cards || [],
      searchName,
      selectedTypes,
      selectedCosts,
    );
    const filteredMaps = getFilteredMaps(maps || [], searchName, selectedTypes, selectedCosts, selectedMapTypes);
    return [
      ...filteredCards.map((data) => ({ kind: GALLERY_KIND.CARD, data })),
      ...filteredMaps.map((data) => ({ kind: GALLERY_KIND.MAP, data })),
    ];
  }, [cards, maps, searchName, selectedTypes, selectedCosts, selectedMapTypes]);

  const rows = useMemo(
    () => chunk(filteredItems, Math.max(columns, 1)),
    [filteredItems, columns],
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

  if (cardsError) {
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

        {filteredItems && (
          <p className="text-sm text-muted-foreground py-2">
            {t("showingCards", {
              count: filteredItems.length,
              total: (cards?.length || 0) + (maps?.length || 0),
            })}
          </p>
        )}
      </div>

      <div
        ref={parentRef}
        className={`flex-1 overflow-y-auto ${styles.scrollContainer}`}
      >
        {filteredItems.length === 0 && !isLoading ? (
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
                  : ROW_HEIGHT_ESTIMATE,
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
                    {row.map((item) =>
                      item.kind === GALLERY_KIND.CARD ? (
                        <CardGalleryItem key={item.data.id} item={item.data} />
                      ) : (
                        <MapGalleryItem key={item.data.id} item={item.data} />
                      ),
                    )}
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
