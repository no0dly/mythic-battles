"use client";

import { Crown, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardModalSkeleton } from "@/components/skeletons";
import type { Card } from "@/types/database.types";
import { api } from "@/trpc/client";
import { COMPANION_TABS } from "@/app/wiki/components/CardGalleryModal/constants";
import { CardPreviewContent } from "./CardPreviewContent";

interface CardPreviewPanelProps {
  card: Card;
}

export function CardPreviewPanel({ card }: CardPreviewPanelProps) {
  const companionId =
    card.extra?.brings ?? card.extra?.dependOn ?? card.extra?.bringsWith?.id;
  const isParent = !!card.extra?.brings || !!card.extra?.bringsWith;

  const { data: companionCard, isLoading } = api.cards.getById.useQuery(
    { id: companionId ?? "" },
    { enabled: !!companionId }
  );

  const parentCard = isParent ? card : companionCard;
  const childCard = isParent ? companionCard : card;
  const defaultTab = isParent ? COMPANION_TABS.MAIN : COMPANION_TABS.COMPANION;
  const showTabs = !!companionId && !!companionCard;

  if (isLoading) {
    return <CardModalSkeleton />;
  }

  if (showTabs && parentCard && childCard) {
    return (
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value={COMPANION_TABS.MAIN} className="flex-1 gap-1.5">
            <Crown className="h-3.5 w-3.5 shrink-0" />
            {parentCard.unit_name}
          </TabsTrigger>
          <TabsTrigger
            value={COMPANION_TABS.COMPANION}
            className="flex-1 gap-1.5"
          >
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            {childCard.unit_name}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={COMPANION_TABS.MAIN}>
          <CardPreviewContent card={parentCard} />
        </TabsContent>
        <TabsContent value={COMPANION_TABS.COMPANION}>
          <CardPreviewContent card={childCard} />
        </TabsContent>
      </Tabs>
    );
  }

  return <CardPreviewContent card={card} />;
}
