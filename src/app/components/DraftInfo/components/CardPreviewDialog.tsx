import Image from "next/image";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Card } from "@/types/database.types";

interface CardPreviewDialogProps {
  card: Card | null;
  onClose: () => void;
}

export const CardPreviewDialog = ({
  card,
  onClose,
}: CardPreviewDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={!!card} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl! border-0 bg-black/95 p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {card ? card.unit_name : t("cardPreview")}
        </DialogTitle>
        <div className="relative flex items-center justify-center p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {card && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Image
                  src={card.image_url}
                  alt={card.unit_name}
                  width={900}
                  height={900}
                  className="rounded-lg shadow-2xl"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>

              <div className="w-full rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-bold text-white">
                      {card.unit_name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <Badge variant={card.unit_type}>
                        {t(`cardType.${card.unit_type}`)}
                      </Badge>
                      <span className="text-lg font-semibold text-purple-300">
                        {t("cost")}: {card.cost}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
