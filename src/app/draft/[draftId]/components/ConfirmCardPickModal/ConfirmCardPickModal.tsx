"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Card } from "@/types/database.types";

interface ConfirmCardPickModalProps {
  card: Card | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmCardPickModal = ({
  card,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmCardPickModalProps) => {
  const { t } = useTranslation();

  if (!card) return null;

  return (
    <Dialog open={!!card} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("confirmCardPick")}</DialogTitle>
          <DialogDescription>
            {t("confirmCardPickDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border-2 border-primary p-4">
            <div className="flex items-start gap-4">
              {card.image_url && (
                <img
                  src={card.image_url}
                  alt={card.unit_name}
                  className="h-24 w-24 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{card.unit_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(`cardType.${card.unit_type}`)}
                </p>
                <div className="mt-2 flex gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {t("cost")}:
                    </span>
                    <span className="ml-1 font-semibold">{card.cost}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {t("strategicValue")}:
                    </span>
                    <span className="ml-1 font-semibold">
                      {card.strategic_value}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {t("areYouSurePickCard")}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

