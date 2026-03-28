"use client";

import Image from "next/image";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { MapTypeBadges } from "@/components/MapTypeBadges";
import type { GameMap } from "@/types/database.types";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                wheel={{ step: 0.1 }}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="relative w-full overflow-hidden rounded-t-lg bg-black/5" style={{ height: "60vh" }}>
                      <TransformComponent
                        wrapperStyle={{ width: "100%", height: "100%" }}
                        contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Image
                          src={map.image_url}
                          alt={map.name}
                          width={1200}
                          height={800}
                          className="max-w-full max-h-full object-contain"
                          draggable={false}
                        />
                      </TransformComponent>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        <button
                          onClick={() => zoomIn()}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                          aria-label="Zoom in"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => zoomOut()}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                          aria-label="Zoom out"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => resetTransform()}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                          aria-label="Reset zoom"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 px-5 py-3 border-t">
                      <h3 className="text-xl font-semibold text-foreground">
                        {map.name}
                      </h3>
                      {map.map_type && map.map_type.length > 0 && (
                        <MapTypeBadges mapTypes={map.map_type} />
                      )}
                    </div>
                  </>
                )}
              </TransformWrapper>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
