"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Card as CardType } from "@/types/database.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Link2 } from "lucide-react";
import { CardDetails } from "./components/CardDetails";
import { CardModalSkeleton } from "@/components/skeletons";
import { api } from "@/trpc/client";
import { COMPANION_TABS } from "./constants";

interface CardGalleryModalProps {
  isShown: boolean;
  card: CardType;
  onCloseModal: () => void;
}

export default function CardGalleryModal({
  isShown,
  card,
  onCloseModal,
}: CardGalleryModalProps) {
  const companionId = card.extra?.brings ?? card.extra?.dependOn ?? card.extra?.bringsWith?.id;
  const isParent = !!card.extra?.brings || !!card.extra?.bringsWith;

  const { data: companionCard, isLoading } = api.cards.getById.useQuery(
    { id: companionId! },
    { enabled: isShown && !!companionId }
  );

  const parentCard = isParent ? card : companionCard;
  const childCard = isParent ? companionCard : card;
  const defaultTab = isParent ? COMPANION_TABS.MAIN : COMPANION_TABS.COMPANION;
  const showTabs = !!companionId && !!companionCard;

  return (
    <Dialog open={isShown} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-3xl!" data-testid="card-modal">
        <DialogHeader>
          <DialogTitle>{card.unit_name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <CardModalSkeleton />
        ) : showTabs ? (
          <Tabs defaultValue={defaultTab}>
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
              <CardDetails card={parentCard!} />
            </TabsContent>
            <TabsContent value={COMPANION_TABS.COMPANION}>
              <CardDetails card={childCard!} />
            </TabsContent>
          </Tabs>
        ) : (
          <CardDetails card={card} />
        )}
      </DialogContent>
    </Dialog>
  );
}
