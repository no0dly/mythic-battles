"use client";

import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/trpc/client";
import Loader from "@/components/Loader";
import { useParams } from "next/navigation";
import { DraftStatusPanel } from "../DraftStatusPanel";
import { DraftCardGrid } from "../DraftCardGrid";
import { getDraftState } from "@/utils/drafts/helpers";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDraftRealtime } from "@/hooks";
import DraftNotFound from "../DraftNotFound";
import DraftCardsError from "../DraftCardsError";
import DraftWaitingForOpponent from "../DraftWaitingForOpponent";

export default function DraftPageContent() {
  const { t } = useTranslation();
  const { draftId } = useParams<{ draftId: string }>();
  const { user } = useUserProfile();

  const {
    data: draft,
    isLoading: draftLoading,
    error: draftError,
  } = api.drafts.getById.useQuery(
    {
      id: draftId,
    },
    {
      enabled: !!draftId,
    }
  );

  const { isConnected } = useDraftRealtime({
    draftId,
    gameId: draft?.game_id,
    enabled: !!draftId && !!user,
  });

  useEffect(() => {
    if (isConnected) {
      console.log("Draft realtime connected");
    }
  }, [isConnected]);

  const draftPoolCardIds = draft?.draft_pool || [];
  const {
    data: cards,
    isLoading: cardsLoading,
    error: cardsError,
  } = api.cards.getByIds.useQuery(
    {
      ids: draftPoolCardIds,
    },
    {
      enabled: !!draft && draftPoolCardIds.length > 0,
    }
  );

  const draftState = useMemo(
    () => getDraftState(draft, user?.id),
    [draft, user?.id]
  );

  const isLoading = draftLoading || cardsLoading;

  if (isLoading) {
    return <Loader />;
  }

  if (draftError || !draft || !draftId) {
    return <DraftNotFound message={draftError?.message} />;
  }

  if (cardsError) {
    return <DraftCardsError message={cardsError.message} />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("pleaseLogin")}</p>
      </div>
    );
  }

  if (draftState === "waiting_for_opponent") {
    return <DraftWaitingForOpponent />;
  }

  if (draftState === "invitation_pending") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">{t("invitationPending")}</h2>
          <p className="text-muted-foreground">
            {t("waitingForOpponentDescription")}
          </p>
        </div>
      </div>
    );
  }

  if (draftState === "draft_in_progress") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        <div className="lg:col-span-1">
          <DraftStatusPanel draft={draft} cards={cards} />
        </div>

        <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
          <DraftCardGrid cards={cards || []} draft={draft} user={user} />
        </div>

        {draftLoading && <Loader />}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-muted-foreground">{t("error")}</p>
      </div>
    </div>
  );
}
