"use client";

import { useCallback, useMemo, useState } from "react";
import { Map } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { api } from "@/trpc/client";
import type { GameMap, MapSide } from "@/types/database.types";
import { MapPreviewDialog } from "../MapPreviewDialog/MapPreviewDialog";

interface MapSectionProps {
  mapId: string | null | undefined;
  mapSide?: MapSide | null;
}

export function MapSection({ mapId, mapSide }: MapSectionProps) {
  const { t } = useTranslation();
  const [previewMap, setPreviewMap] = useState<GameMap | null>(null);
  const { data: maps } = api.maps.list.useQuery(undefined, {
    enabled: !!mapId,
  });

  const selectedMap = useMemo(
    () => maps?.find((m) => m.id === mapId) ?? null,
    [maps, mapId],
  );

  const handleOpen = useCallback(
    () => setPreviewMap(selectedMap),
    [selectedMap],
  );
  const handleClose = useCallback(() => setPreviewMap(null), []);

  if (!selectedMap) return null;

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full items-center justify-between self-start">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            <h3 className="text-lg font-semibold">{t("map")}</h3>
          </div>
          {mapSide && (
            <span className="text-sm font-semibold text-muted-foreground">
              {t("mapSide")}: {mapSide}
            </span>
          )}
        </div>
        <button
          onClick={handleOpen}
          className="group relative w-full overflow-hidden rounded-xl border-2 border-gray-200 shadow-md transition-all hover:border-gray-400 hover:shadow-lg"
        >
          <Image
            src={selectedMap.image_url}
            alt={selectedMap.name}
            width={600}
            height={400}
            className="h-48 w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
            <p className="text-sm font-semibold text-white">
              {selectedMap.name}
            </p>
          </div>
        </button>
      </div>

      <MapPreviewDialog
        map={previewMap}
        mapSide={mapSide}
        onClose={handleClose}
      />
    </>
  );
}
