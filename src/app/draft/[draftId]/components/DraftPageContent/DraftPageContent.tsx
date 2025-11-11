"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/trpc/client";
import Loader from "@/components/Loader";
import { useParams } from "next/navigation";
import { DraftStatusPanel } from "../DraftStatusPanel";
import { DraftCardGrid } from "../DraftCardGrid";
import { ConfirmCardPickModal } from "../ConfirmCardPickModal";
import { parseDraftHistory } from "@/utils/drafts/helpers";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDraftRealtime } from "@/hooks";
import { formatDisplayName } from "@/utils/users";
import { toast } from "sonner";
import type { Card } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { DRAFT_STATUS, GAME_STATUS } from "@/types/constants";

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

  // Подключить realtime обновления
  const { isConnected } = useDraftRealtime({
    draftId,
    gameId: draft?.game_id,
    enabled: !!draftId && !!user,
  });

  // Показать индикатор подключения (опционально)
  useEffect(() => {
    if (isConnected) {
      console.log("Draft realtime connected");
    }
  }, [isConnected]);

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

  // Локальное состояние для оптимистичного обновления выбранных карт
  const [optimisticPickedIds, setOptimisticPickedIds] = useState<Set<string>>(new Set());
  const [selectedCardForPick, setSelectedCardForPick] = useState<Card | null>(null);

  // Pick card mutation
  const pickCardMutation = api.drafts.pickCard.useMutation({
    onSuccess: () => {
      toast.success(t("cardPickedSuccessfully"));
      // Очистить оптимистичное состояние при успехе
      setOptimisticPickedIds(new Set());
      void refetchDraft();
    },
    onError: (error) => {
      toast.error(error.message || t("errorPickingCard"));
      // Откатить оптимистичное обновление при ошибке
      setOptimisticPickedIds(new Set());
    },
  });

  // Calculate picked cards for each player
  const draftHistory = useMemo(() => {
    if (!draft) return null;
    return parseDraftHistory(draft.draft_history);
  }, [draft]);

  // Мемоизировать pickedCardIds как строку для сравнения
  const pickedCardIdsString = useMemo(() => {
    if (!draftHistory?.picks) return "";
    return draftHistory.picks.map((pick) => pick.card_id).sort().join(",");
  }, [draftHistory]);

  // Создавать Set только когда строка меняется
  const pickedCardIds = useMemo(() => {
    const baseSet = pickedCardIdsString 
      ? new Set(pickedCardIdsString.split(","))
      : new Set<string>();
    
    // Добавить оптимистично выбранные карты
    optimisticPickedIds.forEach(id => baseSet.add(id));
    
    return baseSet;
  }, [pickedCardIdsString, optimisticPickedIds]);

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

  // Обработчик клика по карте с useCallback
  // Принимает cardId от кнопки "Pick" в DraftCardItem
  const handlePickCardClick = useCallback((cardId: string) => {
    if (!isCurrentUserTurn || !cards) return;
    
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setSelectedCardForPick(card);
    }
  }, [isCurrentUserTurn, cards]);

  // Подтверждение выбора карты
  const handleConfirmPick = useCallback(() => {
    if (!selectedCardForPick) return;
    
    // Оптимистично добавить карту как выбранную
    setOptimisticPickedIds(prev => new Set([...prev, selectedCardForPick.id]));
    
    pickCardMutation.mutate({
      draft_id: draftId,
      card_id: selectedCardForPick.id,
    });
    
    setSelectedCardForPick(null);
  }, [selectedCardForPick, draftId, pickCardMutation]);

  // Отмена выбора карты
  const handleCancelPick = useCallback(() => {
    setSelectedCardForPick(null);
  }, []);

  // Определить состояние драфта
  const draftState = useMemo(() => {
    if (!draft || !user) return "loading";

    // Если драфт в процессе, показать основной интерфейс
    if (draft.draft_status === DRAFT_STATUS.DRAFT) {
      const gameStatus = draft.game?.status;
      const invitation = draft.invitation;
      
      // Проверяем наличие pending приглашения
      const hasPendingInvitation = invitation?.status === "pending";
      
      // Если есть pending приглашение
      if (hasPendingInvitation) {
        // Проверяем роль текущего пользователя в приглашении
        const isInviter = invitation.inviter_id === user.id;
        const isInvitee = invitation.invitee_id === user.id;
        
        if (isInviter) {
          // Создатель игры ждет принятия приглашения
          return "waiting_for_opponent";
        }
        
        if (isInvitee) {
          // Приглашенный игрок должен был принять приглашение через колокольчик
          // Но если он попал сюда, показываем ожидание (приглашение обрабатывается в колокольчике)
          return "invitation_pending";
        }
      }
      
      // Если приглашения нет или оно принято/отклонено, показываем драфт
      // Проверяем дополнительно статус игры
      if (gameStatus === GAME_STATUS.DRAFT || 
          gameStatus === GAME_STATUS.IN_PROGRESS ||
          invitation?.status === "accepted") {
        // Игра началась, показываем драфт
        return "draft_in_progress";
      }
      
      // Если игра все еще в статусе INVITE_TO_DRAFT, но приглашение не pending
      // (возможно, было отклонено или еще не загрузилось)
      if (gameStatus === GAME_STATUS.INVITE_TO_DRAFT) {
        // Проверяем, есть ли вообще приглашение
        if (!invitation) {
          // Приглашение еще не создано или не загрузилось, ждем
          return "waiting_for_opponent";
        }
        // Если приглашение есть но не pending (accepted, rejected и т.д.), показываем драфт
        return "draft_in_progress";
      }
      
      // По умолчанию показываем драфт
      return "draft_in_progress";
    }

    return "unknown";
  }, [draft, user]);
  
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

  // Показать состояние ожидания оппонента
  if (draftState === "waiting_for_opponent") {
    return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center space-y-4">
        <Loader />
        <h2 className="text-2xl font-semibold">{t("waitingForOpponent")}</h2>
        <p className="text-muted-foreground">
          {t("waitingForOpponentDescription")}
        </p>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {t("draftStatus")}: {t("waitingForAcceptance")}
        </Badge>
      </div>
    </div>);
  }

  // Показать состояние ожидания принятия приглашения (для приглашенного)
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

  // Показать основной интерфейс драфта, если он в процессе
  if (draftState === "draft_in_progress") {
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
          onPickCard={handlePickCardClick}
          isLoading={pickCardMutation.isPending}
          canPick={isCurrentUserTurn}
        />
      </div>

      <ConfirmCardPickModal
        card={selectedCardForPick}
        onConfirm={handleConfirmPick}
        onCancel={handleCancelPick}
        isLoading={pickCardMutation.isPending}
      />
    </div>
    );
  }

  // Неизвестное состояние
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-muted-foreground">{t("error")}</p>
      </div>
    </div>
  );
}
