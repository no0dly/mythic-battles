import Image from "next/image";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TalentBadges } from "@/components/TalentBadges";
import { ClassBadges } from "@/components/ClassBadges";
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
        className="max-w-2xl border bg-white p-0 dark:bg-white"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {card ? card.unit_name : t("cardPreview")}
        </DialogTitle>
        <div className="relative flex items-center justify-center p-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {card && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-full">
                <Image
                  src={card.image_url}
                  alt={card.unit_name}
                  width={900}
                  height={900}
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>

              <div className="w-full rounded-lg border bg-muted/30 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {card.unit_name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <Badge variant={card.unit_type}>
                        {t(`cardType.${card.unit_type}`)}
                      </Badge>
                      <span className="text-lg font-semibold text-muted-foreground">
                        {t("cost")}: {card.cost}
                      </span>
                    </div>
                  </div>
                  <ClassBadges classes={card.class} />
                  <TalentBadges talents={card.talents ?? []} />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
