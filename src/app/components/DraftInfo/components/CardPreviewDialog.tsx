"use client";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Card } from "@/types/database.types";
import { CardPreviewPanel } from "./CardPreviewPanel";

interface CardPreviewDialogProps {
  card: Card | null;
  onClose: () => void;
}

export const CardPreviewDialog = ({ card, onClose }: CardPreviewDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={!!card}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="max-w-2xl border bg-white p-0 dark:bg-white"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {card ? card.unit_name : t("cardPreview")}
        </DialogTitle>
        <div className="relative flex items-center justify-center p-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
            aria-label={t("close")}
          >
            <X className="h-6 w-6" />
          </button>

          {card ? <CardPreviewPanel card={card} /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
