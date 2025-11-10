"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/trpc/client";
import Loader from "@/components/Loader";
import { useParams } from "next/navigation";
import { DraftStatusPanel } from "../DraftStatusPanel";
import { DraftCardGrid } from "../DraftCardGrid";
import { parseDraftHistory } from "@/utils/drafts/helpers";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatDisplayName } from "@/utils/users";
import { toast } from "sonner";

export default function DraftPageContent() {
  const { t } = useTranslation();
  const { draftId } = useParams<{ draftId: string }>();
  const { user } = useUserProfile();

  const {
    data: draft,
    isLoading: draftLoading,
    error: draftError,
    refetch: refetchDraft,
  } = api.drafts.getById.useQuery(
    {
      id: draftId,
    },
    {
      enabled: !!draftId,
    }
  );

  // Default player allowed points (can be fetched from game if needed)
  const playerAllowedPoints = 18;

  // Fetch cards from draft_pool
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

  // Fetch player information
  const playerIds = draft ? [draft.player1_id, draft.player2_id] : [];
  const { data: players, isLoading: playersLoading } =
    api.users.getUsersByIds.useQuery(
      {
        userIds: playerIds,
      },
      {
        enabled: !!draft && playerIds.length === 2,
      }
    );

  // Pick card mutation
  const pickCardMutation = api.drafts.pickCard.useMutation({
    onSuccess: () => {
      toast.success(t("cardPickedSuccessfully"));
      void refetchDraft();
    },
    onError: (error) => {
      toast.error(error.message || t("errorPickingCard"));
    },
  });

  // Calculate picked cards for each player
  const draftHistory = useMemo(() => {
    if (!draft) return null;
    return parseDraftHistory(draft.draft_history);
  }, [draft]);

  const pickedCardIds = useMemo(() => {
    if (!draftHistory?.picks) return new Set<string>();
    return new Set(draftHistory.picks.map((pick) => pick.card_id));
  }, [draftHistory]);

  const player1Cards = useMemo(() => {
    if (!draft || !cards || !draftHistory?.picks) return [];
    const player1Picks = draftHistory.picks.filter(
      (pick) => pick.player_id === draft.player1_id
    );
    const player1CardIds = player1Picks.map((pick) => pick.card_id);
    return cards.filter((card) => player1CardIds.includes(card.id));
  }, [draft, cards, draftHistory]);

  const player2Cards = useMemo(() => {
    if (!draft || !cards || !draftHistory?.picks) return [];
    const player2Picks = draftHistory.picks.filter(
      (pick) => pick.player_id === draft.player2_id
    );
    const player2CardIds = player2Picks.map((pick) => pick.card_id);
    return cards.filter((card) => player2CardIds.includes(card.id));
  }, [draft, cards, draftHistory]);

  // Get player names
  const player1Name = useMemo(() => {
    if (!players || !draft) return t("player1");
    const player1 = players.find((p) => p.id === draft.player1_id);
    return player1
      ? formatDisplayName(player1.display_name, player1.email)
      : t("player1");
  }, [players, draft, t]);

  const player2Name = useMemo(() => {
    if (!players || !draft) return t("player2");
    const player2 = players.find((p) => p.id === draft.player2_id);
    return player2
      ? formatDisplayName(player2.display_name, player2.email)
      : t("player2");
  }, [players, draft, t]);

  // Check if it's current user's turn
  const isCurrentUserTurn = useMemo(() => {
    if (!draft || !user) return false;
    return draft.current_turn_user_id === user.id;
  }, [draft, user]);

  // Handle pick card
  const handlePickCard = (cardId: string) => {
    if (!draftId || !isCurrentUserTurn) return;
    pickCardMutation.mutate({
      draft_id: draftId,
      card_id: cardId,
    });
  };

  const isLoading = draftLoading || cardsLoading || playersLoading;

  if (isLoading) {
    return <Loader />;
  }

  if (draftError || !draft || !draftId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold mb-2">
            {t("error")}
          </p>
          <p className="text-muted-foreground">
            {draftError?.message || t("draftNotFound")}
          </p>
        </div>
      </div>
    );
  }

  if (cardsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold mb-2">
            {t("error")}
          </p>
          <p className="text-muted-foreground">
            {cardsError.message || t("errorLoadingCards")}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("pleaseLogin")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
      <div className="lg:col-span-1">
        <DraftStatusPanel
          draft={draft}
          player1Name={player1Name}
          player2Name={player2Name}
          player1Cards={player1Cards}
          player2Cards={player2Cards}
          playerAllowedPoints={playerAllowedPoints}
          currentUserId={user.id}
        />
      </div>

      <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
        <DraftCardGrid
          cards={cards || []}
          pickedCardIds={pickedCardIds}
          onPickCard={handlePickCard}
          isLoading={pickCardMutation.isPending}
          canPick={isCurrentUserTurn}
        />
      </div>
    </div>
  );
}
