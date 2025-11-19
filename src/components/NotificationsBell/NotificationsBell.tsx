"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatDisplayName } from "@/utils/users";
import { createClient } from "@/lib/supabase/client";
import type { GameInvitation, Draft } from "@/types/database.types";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  type: "invitation" | "active_draft";
  title: string;
  description: string;
  action?: () => void;
  timestamp: Date;
  data: GameInvitation | Draft;
}

export const NotificationsBell = () => {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const router = useRouter();
  const utils = api.useUtils();

  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  // Получить активные драфты
  const { data: activeDrafts, refetch: refetchDrafts } =
    api.drafts.getActiveDrafts.useQuery(undefined, { enabled: !!user });

  // Получить приглашения
  const { data: invitations, refetch: refetchInvitations } =
    api.gameInvitations.getMyInvitations.useQuery(
      { status: "pending" },
      { enabled: !!user }
    );

  // Получить информацию об игроках для драфтов
  const draftPlayerIds =
    activeDrafts?.flatMap((d) => [d.player1_id, d.player2_id]) || [];
  const { data: players } = api.users.getUsersByIds.useQuery(
    { userIds: [...new Set(draftPlayerIds)] },
    { enabled: draftPlayerIds.length > 0 }
  );

  // Получить информацию об отправителях приглашений
  const inviterIds = invitations?.map((inv) => inv.inviter_id) || [];
  const { data: inviters } = api.users.getUsersByIds.useQuery(
    { userIds: [...new Set(inviterIds)] },
    { enabled: inviterIds.length > 0 }
  );

  // Мутации для приглашений
  const acceptMutation = api.gameInvitations.accept.useMutation({
    onSuccess: () => {
      toast.success(t("invitationAccepted"));
      // После принятия приглашения обновляем оба списка
      void refetchInvitations();
      void refetchDrafts();
      void utils.sessions.getUserSessions.invalidate();
    },
  });

  const rejectMutation = api.gameInvitations.reject.useMutation({
    onSuccess: () => {
      toast.info(t("invitationRejected"));
      void refetchInvitations();
    },
  });

  // Подписка на realtime обновления
  useEffect(() => {
    if (!user) return;

    // Подписка на новые и обновленные приглашения
    const invitationsChannel = supabase
      .channel("notifications-invitations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_invitations",
          filter: `invitee_id=eq.${user.id}`,
        },
        () => {
          // При создании приглашения обновляем оба списка, чтобы активные драфты пересчитались
          void refetchInvitations();
          void refetchDrafts();
          toast.info(t("newGameInvitation"));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_invitations",
          filter: `invitee_id=eq.${user.id}`,
        },
        () => {
          // При изменении статуса приглашения обновляем оба списка
          void refetchInvitations();
          void refetchDrafts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_invitations",
          filter: `inviter_id=eq.${user.id}`,
        },
        () => {
          // Создатель игры тоже должен видеть изменения статуса приглашения
          void refetchInvitations();
          void refetchDrafts();
        }
      )
      .subscribe();

    // Подписка на новые драфты
    const draftsChannel = supabase
      .channel("notifications-drafts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "drafts",
          filter: `player1_id=eq.${user.id}`,
        },
        () => {
          // При создании драфта обновляем оба списка,
          // чтобы фильтрация активных драфтов работала правильно
          // (приглашение может быть создано сразу после драфта)
          void refetchInvitations();
          void refetchDrafts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "drafts",
          filter: `player2_id=eq.${user.id}`,
        },
        () => {
          // При создании драфта обновляем оба списка,
          // чтобы фильтрация активных драфтов работала правильно
          // (приглашение может быть создано сразу после драфта)
          void refetchInvitations();
          void refetchDrafts();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(invitationsChannel);
      void supabase.removeChannel(draftsChannel);
    };
  }, [user, supabase, refetchInvitations, refetchDrafts, t]);

  // Формирование списка уведомлений
  const notifications: NotificationItem[] = [];

  // Создать Set игр с pending приглашениями для быстрой проверки
  // Проверяем приглашения где текущий пользователь - получатель (invitee)
  const gamesWithPendingInvitations = useMemo(() => {
    return new Set(
      invitations
        ?.filter(
          (inv) => inv.invitee_id === user?.id && inv.status === "pending"
        )
        .map((inv) => inv.game_id) || []
    );
  }, [invitations, user?.id]);

  // Добавить приглашения (приоритет над активными драфтами)
  invitations?.forEach((invitation) => {
    // Показываем только приглашения, где текущий пользователь - получатель и статус pending
    if (invitation.invitee_id !== user?.id || invitation.status !== "pending")
      return;

    const inviter = inviters?.find((p) => p.id === invitation.inviter_id);
    const inviterName = inviter
      ? formatDisplayName(inviter.display_name, inviter.email)
      : t("unknownPlayer");

    notifications.push({
      id: invitation.id,
      type: "invitation",
      title: t("gameInvitation"),
      description: t("invitationFromPlayer", { player: inviterName }),
      action: () => {
        acceptMutation.mutate({ invitation_id: invitation.id });
      },
      timestamp: new Date(invitation.created_at),
      data: invitation,
    });
  });

  // Добавить активные драфты (только те, для которых нет pending приглашений)
  // Дополнительная фильтрация на клиенте для защиты от race condition
  activeDrafts?.forEach((draft) => {
    // Пропускаем драфты, для которых есть pending приглашение где текущий пользователь - получатель
    if (gamesWithPendingInvitations.has(draft.game_id)) return;

    const opponentId =
      draft.player1_id === user?.id ? draft.player2_id : draft.player1_id;
    const opponent = players?.find((p) => p.id === opponentId);
    const opponentName = opponent
      ? formatDisplayName(opponent.display_name, opponent.email)
      : t("unknownPlayer");

    notifications.push({
      id: draft.id,
      type: "active_draft",
      title: t("activeDraft"),
      description: t("continueDraftWithPlayer", { player: opponentName }),
      action: () => {
        router.push(`/draft/${draft.id}`);
        setIsOpen(false);
      },
      timestamp: new Date(draft.created_at),
      data: draft,
    });
  });

  // Сортировка по времени (новые сверху)
  notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const unreadCount = notifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col max-h-[400px]">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{t("notifications")}</h3>
          </div>
          <div className="overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t("noNotifications")}
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {notification.type === "invitation" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const inv = notification.data as GameInvitation;
                              rejectMutation.mutate({ invitation_id: inv.id });
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            {t("reject")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={notification.action}
                            disabled={acceptMutation.isPending}
                          >
                            {t("accept")}
                          </Button>
                        </div>
                      )}
                      {notification.type === "active_draft" && (
                        <Button size="sm" onClick={notification.action}>
                          {t("goToDraft")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
