"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { MapTypeBadges } from "@/components/MapTypeBadges";
import type { GameMap } from "@/types/database.types";

interface MapPreviewDialogProps {
  map: GameMap | null;
  onClose: () => void;
}

export const MapPreviewDialog = ({ map, onClose }: MapPreviewDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={!!map} onOpenChange={onClose}>
      <DialogContent
        className="w-[90vw] max-w-5xl sm:max-w-5xl border bg-white p-0 dark:bg-white"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {map ? map.name : t("map")}
        </DialogTitle>

        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {map && (
            <div className="flex flex-col w-full">
              <div className="relative w-full">
                <Image
                  src={map.image_url}
                  alt={map.name}
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-t-lg"
                />
              </div>

              <div className="flex flex-col gap-2 px-5 py-3 border-t">
                <h3 className="text-xl font-semibold text-foreground">
                  {map.name}
                </h3>
                {map.map_type && map.map_type.length > 0 && (
                  <MapTypeBadges mapTypes={map.map_type} />
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
