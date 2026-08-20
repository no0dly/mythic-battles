"use client";

import { useCallback, useState } from "react";
import { api } from "@/trpc/client";
import Loader from "@/components/Loader";
import { CardPreviewDialog } from "@/app/components/DraftInfo/components/CardPreviewDialog";
import type { Card } from "@/types/database.types";
import SharedDraftHeader from "../SharedDraftHeader/SharedDraftHeader";
import SharedDraftNotFound from "../SharedDraftNotFound/SharedDraftNotFound";
import SharedDraftPreview from "../SharedDraftPreview/SharedDraftPreview";
import type { SharedDraftContentProps } from "./types";

export default function SharedDraftContent({ slug }: SharedDraftContentProps) {
  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  const { data, isLoading, error } = api.sharedDrafts.getBySlug.useQuery(
    { slug },
    { enabled: !!slug },
  );

  const handleCardClick = useCallback((card: Card) => {
    setPreviewCard(card);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewCard(null);
  }, []);

  if (isLoading) {
    return (
      <div className="py-16">
        <Loader local />
      </div>
    );
  }

  if (error || !data) {
    return <SharedDraftNotFound message={error?.message} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <SharedDraftHeader title={data.title} />
      <SharedDraftPreview draft={data} onCardClick={handleCardClick} />
      <CardPreviewDialog card={previewCard} onClose={handleClosePreview} />
    </div>
  );
}
