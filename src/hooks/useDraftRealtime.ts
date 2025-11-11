import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/trpc/client";

interface UseDraftRealtimeProps {
  draftId: string | null;
  gameId?: string | null;
  enabled?: boolean;
}

export const useDraftRealtime = ({
  draftId,
  gameId,
  enabled = true,
}: UseDraftRealtimeProps) => {
  const supabase = createClient();
  const utils = api.useUtils();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!draftId || !enabled) return;

    const channel = supabase
      .channel(`draft-${draftId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drafts",
          filter: `id=eq.${draftId}`,
        },
        (payload) => {
          console.log("Draft realtime update received:", payload);
          // Инвалидировать запрос - React Query автоматически перезапросит активные запросы
          void utils.drafts.getById.invalidate({ id: draftId });
        }
      )
      .subscribe((status) => {
        console.log(`Draft realtime subscription status: ${status}`, { draftId });
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
          console.error("Draft realtime subscription error", { draftId, status });
        }
      });

    return () => {
      console.log("Cleaning up draft realtime subscription", { draftId });
      void supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [draftId, enabled, supabase, utils]);

  // Подписка на изменения игры и приглашений, если gameId передан
  useEffect(() => {
    if (!gameId || !enabled) return;

    const gameChannel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          // Инвалидировать запрос драфта (который включает игру)
          console.log("Game status updated:", payload);
          if (draftId) {
            void utils.drafts.getById.invalidate({ id: draftId });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(gameChannel);
    };
  }, [gameId, draftId, enabled, supabase, utils]);

  // Отдельная подписка на game_invitations без фильтра по game_id
  // Потому что Supabase Realtime фильтры для UPDATE работают только с изменяемыми полями
  useEffect(() => {
    if (!gameId || !enabled || !draftId) return;

    const invitationsChannel = supabase
      .channel(`game-invitations-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Слушаем все события (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "game_invitations",
        },
        (payload) => {
          // Проверяем, относится ли изменение к нашей игре
          const newRecord = payload.new as { game_id?: string } | undefined;
          const oldRecord = payload.old as { game_id?: string } | undefined;
          
          // Для INSERT и UPDATE проверяем payload.new
          // Для DELETE проверяем payload.old
          const relatedGameId = newRecord?.game_id || oldRecord?.game_id;
          
          if (relatedGameId === gameId) {
            console.log("Game invitation changed for our game:", payload);
            void utils.drafts.getById.invalidate({ id: draftId });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(invitationsChannel);
    };
  }, [gameId, draftId, enabled, supabase, utils]);

  return { isConnected };
};

