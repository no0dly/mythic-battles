"use client";

import { memo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import type { GameMap } from "@/types/database.types";
import { OriginBadge } from "@/components/OriginBadge";
import { MapPreviewDialog } from "@/app/draft/[draftId]/components/MapPreviewDialog/MapPreviewDialog";

interface MapGalleryItemProps {
  item: GameMap;
}

function MapGalleryItem({ item }: MapGalleryItemProps) {
  const [isModalShown, setIsModalShown] = useState(false);

  return (
    <>
      <button
        type="button"
        className="text-left w-full cursor-pointer"
        onClick={() => setIsModalShown(true)}
        aria-label={item.name}
      >
        <Card className="h-full hover:shadow-sm transition-shadow py-2 gap-1">
          <CardHeader className="px-2 py-1">
            <CardTitle className="text-base">{item.name}</CardTitle>
            <CardDescription>
              <OriginBadge origin={item.origin} showLabel={false} />
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 py-1">
            <div className="relative flex items-center justify-center h-full w-full min-h-[200px]">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                loading="lazy"
                className="object-contain"
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
              />
            </div>
          </CardContent>
        </Card>
      </button>

      <MapPreviewDialog
        map={isModalShown ? item : null}
        onClose={() => setIsModalShown(false)}
      />
    </>
  );
}

export default memo(MapGalleryItem);
