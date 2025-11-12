"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { createClient } from "@/lib/supabase/client";
import { GameInvitationModal } from "@/components/GameInvitationModal";
import type { GameInvitation } from "@/types/database.types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatDisplayName } from "@/utils/users";

export const InvitationNotifications = () => {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const [currentInvitation, setCurrentInvitation] =
    useState<GameInvitation | null>(null);
  const [inviterName, setInviterName] = useState<string>("");
  const supabase = createClient();

  // Загрузить активные приглашения при монтировании
  const { data: invitations } = api.gameInvitations.getMyInvitations.useQuery(
    { status: "pending" },
    { enabled: !!user }
  );

  // Мутации
  const acceptMutation = api.gameInvitations.accept.useMutation({
    onSuccess: () => {
      toast.success(t("invitationAccepted"));
      setCurrentInvitation(null);
    },
    onError: (error) => {
      toast.error(error.message || t("errorAcceptingInvitation"));
    },
  });

  const rejectMutation = api.gameInvitations.reject.useMutation({
    onSuccess: () => {
      toast.info(t("invitationRejected"));
      setCurrentInvitation(null);
    },
    onError: (error) => {
      toast.error(error.message || t("errorRejectingInvitation"));
    },
  });

  // Получить информацию об отправителе
  const { data: inviterData } = api.users.getUsersByIds.useQuery(
    { userIds: currentInvitation ? [currentInvitation.inviter_id] : [] },
    { enabled: !!currentInvitation }
  );

  /* eslint-disable */
  useEffect(() => {
    if (inviterData && inviterData.length > 0) {
      const inviter = inviterData[0];

      // TODO: Fix this
      setInviterName(
        formatDisplayName(inviter.display_name ?? "", inviter.email ?? "") ||
          t("unknownPlayer")
      );
    }
  }, [inviterData, t]);

  // Показать первое активное приглашение
  useEffect(() => {
    if (invitations && invitations.length > 0 && !currentInvitation) {
      // Показываем только те приглашения, где текущий пользователь - получатель
      const pendingInvitation = invitations.find(
        (inv) => inv.invitee_id === user?.id && inv.status === "pending"
      );
      if (pendingInvitation) {
        // TODO: Fix this

        setCurrentInvitation(pendingInvitation);
      }
    }
  }, [invitations, currentInvitation, user]);
  /* eslint-enable */

  // Подписка на новые приглашения через Supabase Realtime
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("game-invitations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_invitations",
          filter: `invitee_id=eq.${user.id}`,
        },
        (payload) => {
          const newInvitation = payload.new as GameInvitation;
          if (newInvitation.status === "pending") {
            setCurrentInvitation(newInvitation);
            toast.info(t("newGameInvitation"));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, supabase, t]);

  const handleAccept = () => {
    if (!currentInvitation) return;
    acceptMutation.mutate({ invitation_id: currentInvitation.id });
  };

  const handleReject = () => {
    if (!currentInvitation) return;
    rejectMutation.mutate({ invitation_id: currentInvitation.id });
  };

  return (
    <GameInvitationModal
      invitation={currentInvitation}
      inviterName={inviterName}
      onAccept={handleAccept}
      onReject={handleReject}
      isLoading={acceptMutation.isPending || rejectMutation.isPending}
    />
  );
};
