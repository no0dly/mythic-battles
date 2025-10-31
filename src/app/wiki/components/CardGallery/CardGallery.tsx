"use client";

import { api } from "@/trpc/client";

import Loader from "@/components/Loader";
import CardGalleryModal from "../CardGalleryModal";
import CardGalleryItem, { type CardItem } from "../CardGalleryItem";
import { useState } from "react";

export default function CardGallery() {
  const { data, isLoading, error } = api.cards.list.useQuery();
  const [selected, setSelected] = useState<CardItem | null>(null);

  if (error) {
    return (
      <p className="text-red-600 dark:text-red-400">Failed to load cards.</p>
    );
  }

  const onCardClickHandler = (item: CardItem) => () => setSelected(item);
  const onCloseHandler = () => setSelected(null);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.map((item) => (
          <CardGalleryItem
            key={item.id}
            item={item}
            onCardClickHandler={onCardClickHandler(item)}
          />
        ))}
      </div>

      {!!selected && (
        <CardGalleryModal selected={selected} onCloseAction={onCloseHandler} />
      )}

      {isLoading && <Loader />}
    </div>
  );
}
