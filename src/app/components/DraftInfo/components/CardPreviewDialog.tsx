"use client";
import { useTranslation } from "react-i18next";
import { X, Crown, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardModalSkeleton } from "@/components/skeletons";
import type { Card } from "@/types/database.types";
import { api } from "@/trpc/client";
import { COMPANION_TABS } from "@/app/wiki/components/CardGalleryModal/constants";
import { CardPreviewContent } from "./CardPreviewContent";

interface CardPreviewDialogProps {
  card: Card | null;
  onClose: () => void;
}

export const CardPreviewDialog = ({ card, onClose }: CardPreviewDialogProps) => {
  const { t } = useTranslation();

  const companionId = card?.extra?.brings ?? card?.extra?.dependOn ?? card?.extra?.bringsWith?.id;
  const isParent = !!card?.extra?.brings || !!card?.extra?.bringsWith;

  const { data: companionCard, isLoading } = api.cards.getById.useQuery(
    { id: companionId! },
    { enabled: !!card && !!companionId }
  );

  const parentCard = isParent ? card : companionCard;
  const childCard = isParent ? companionCard : card;
  const defaultTab = isParent ? COMPANION_TABS.MAIN : COMPANION_TABS.COMPANION;
  const showTabs = !!companionId && !!companionCard;

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
            isLoading ? (
              <CardModalSkeleton />
            ) : showTabs ? (
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value={COMPANION_TABS.MAIN} className="flex-1 gap-1.5">
                    <Crown className="h-3.5 w-3.5 shrink-0" />
                    {parentCard!.unit_name}
                  </TabsTrigger>
                  <TabsTrigger value={COMPANION_TABS.COMPANION} className="flex-1 gap-1.5">
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    {childCard!.unit_name}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={COMPANION_TABS.MAIN}>
                  <CardPreviewContent card={parentCard!} />
                </TabsContent>
                <TabsContent value={COMPANION_TABS.COMPANION}>
                  <CardPreviewContent card={childCard!} />
                </TabsContent>
              </Tabs>
            ) : (
              <CardPreviewContent card={card} />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
