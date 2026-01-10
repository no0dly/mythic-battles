"use client";

import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFriends, useUserProfile } from "@/hooks";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { SelectWithLoading, NumberInputField } from "@/components/FormFields";
import {
  DraftSettingsFormValues,
  getDraftSettingsSchema,
  DRAFT_SIZE_OPTIONS,
  USER_ALLOWED_POINTS_OPTIONS,
} from "./constants";
import Loader from "@/components/Loader";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/client";
import { DEFAULT_DRAFT_SETTINGS } from "@/types/constants";
import { useMemo, useEffect } from "react";
import { Game, Session } from "@/types/database.types";

export default function DraftSettings() {
  const { t } = useTranslation();
  const { friends, isLoading } = useFriends();
  const { user } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const form = useForm<DraftSettingsFormValues>({
    resolver: zodResolver(getDraftSettingsSchema(t)),
    defaultValues: {
      opponentId: "",
      user_allowed_points: DEFAULT_DRAFT_SETTINGS.user_allowed_points,
      draft_size: DEFAULT_DRAFT_SETTINGS.draft_size,
      gods_amount: DEFAULT_DRAFT_SETTINGS.gods_amount,
      titans_amount: DEFAULT_DRAFT_SETTINGS.titans_amount,
      troop_attachment_amount: DEFAULT_DRAFT_SETTINGS.troop_attachment_amount,
    },
  });

  // Получить информацию о сессии, если sessionId передан
  const { data: session, isLoading: isLoadingSession } =
    api.sessions.getById.useQuery({ id: sessionId! }, { enabled: !!sessionId });

  // Authorization check: verify user is part of the session
  useEffect(() => {
    if (sessionId && session && user) {
      const isAuthorized =
        session.player1_id === user.id || session.player2_id === user.id;

      if (!isAuthorized) {
        toast.error(t("notAuthorizedToAccessSession"));
        router.push("/");
      }
    }
  }, [sessionId, session, user, router, t]);

  // Prepopulate opponent when sessionId is present
  useEffect(() => {
    if (session && user && sessionId) {
      const opponentId =
        session.player1_id === user.id
          ? session.player2_id
          : session.player1_id;

      if (opponentId) {
        form.setValue("opponentId", opponentId);
      }
    }
  }, [session, user, sessionId, form]);

  // Мутация создания приглашения
  const createInvitationMutation = api.gameInvitations.create.useMutation({
    onSuccess: () => {
      toast.success(t("invitationSent"));
    },
    onError: (error) => {
      toast.error(error.message || t("errorSendingInvitation"));
    },
  });

  const inviteCreation = ({
    game,
    session: currentSession,
    draft,
  }: {
    game: Game;
    session: Session;
    draft: { id: string };
  }) => {
    // После создания игры, создать приглашение
    if (session || currentSession) {
      const sessionData = session || currentSession;
      const inviteeId =
        sessionData.player1_id === user?.id
          ? sessionData.player2_id
          : sessionData.player1_id;

      if (inviteeId) {
        createInvitationMutation.mutate({
          game_id: game.id,
          session_id: sessionData.id,
          invitee_id: inviteeId,
        });
      }
    }

    toast.success(t("sessionCreatedSuccessfully"));

    // Перенаправить на страницу драфта, если он создан
    if (draft?.id) {
      router.push(`/draft/${draft.id}`);
    } else {
      router.push("/");
    }
  };

  const {
    mutate: createSessionWithDraft,
    isPending: isCreatingSessionPending,
  } = api.sessions.createWithDraft.useMutation({
    onSuccess: inviteCreation,
    onError: (error) => {
      console.error("Error creating session:", error);
      toast.error(`${t("errorCreatingSession")}: ${error.message}`);
    },
  });

  const { mutate: createGameWithDraft, isPending: isCreatingGamePending } =
    api.games.createGameWithDraft.useMutation({
      onSuccess: inviteCreation,
      onError: (error) => {
        console.error("Error creating game:", error);
        toast.error(`${t("errorCreatingGame")}: ${error.message}`);
      },
    });

  const opponentOptions = useMemo(
    () =>
      friends.map((friend) => ({
        value: friend.id,
        label: friend.displayName,
      })),
    [friends]
  );

  const handleSubmit = (values: DraftSettingsFormValues) => {
    if (sessionId) {
      createGameWithDraft({
        ...values,
        sessionId,
      });
    } else {
      createSessionWithDraft(values);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4 flex-1"
        >
          <div className="flex flex-col gap-6">
            <div className="max-w-[400px]">
              <SelectWithLoading
                control={form.control}
                name="opponentId"
                labelKey="selectYourOpponent"
                options={opponentOptions}
                isLoading={isLoading || isLoadingSession}
                emptyMessageKey="noFriendsYet"
                disabled={!!sessionId}
              />
            </div>
            <div className="max-w-[400px]">
              <SelectWithLoading
                control={form.control}
                name="user_allowed_points"
                labelKey="userAllowedPoints"
                options={USER_ALLOWED_POINTS_OPTIONS}
                disabled={true}
              />
            </div>
            <div className="max-w-[400px]">
              <SelectWithLoading
                control={form.control}
                name="draft_size"
                labelKey="draftCount"
                options={DRAFT_SIZE_OPTIONS}
                disabled={true}
              />
            </div>
            <div className="max-w-[400px]">
              <NumberInputField
                control={form.control}
                name="titans_amount"
                labelKey="titansAmount"
              />
            </div>
            <div className="max-w-[400px]">
              <NumberInputField
                control={form.control}
                name="gods_amount"
                labelKey="godsAmount"
              />
            </div>
            <div className="max-w-[400px]">
              <NumberInputField
                control={form.control}
                name="troop_attachment_amount"
                labelKey="troopAttachmentAmount"
              />
            </div>
          </div>
          <div className="flex-shrink-0 mt-auto flex justify-end">
            <ShimmerButton
              type="submit"
              className="px-8 py-4 text-lg font-semibold"
              loading={
                form.formState.isSubmitting ||
                isCreatingSessionPending ||
                isCreatingGamePending
              }
              disabled={isLoading || friends.length === 0}
            >
              {form.formState.isSubmitting ? t("loading") : t("generateDraft")}
            </ShimmerButton>
          </div>
        </form>
      </Form>
      {(isLoading || isCreatingSessionPending || isCreatingGamePending) && (
        <Loader />
      )}
    </div>
  );
}
