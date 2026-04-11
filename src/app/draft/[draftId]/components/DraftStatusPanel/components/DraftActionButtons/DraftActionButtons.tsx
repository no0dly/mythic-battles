"use client";

import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  DraftResetRequest,
  DraftReadyCheck,
  DraftStatus,
} from "@/types/database.types";
import { DRAFT_STATUS } from "@/types/constants";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState } from "react";

interface DraftActionButtonsProps {
  draftId: string;
  draftStatus: DraftStatus;
  canStartGame?: boolean;
  startGameRestrictionReason?: string;
  resetRequest?: DraftResetRequest;
  readyCheck?: DraftReadyCheck;
}

export function DraftActionButtons({
  draftId,
  draftStatus,
  canStartGame = true,
  startGameRestrictionReason,
  resetRequest,
  readyCheck,
}: DraftActionButtonsProps) {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const utils = api.useUtils();

  const markReadyMutation = api.draftReadyChecks.markReady.useMutation({
    onMutate: () => {
      utils.drafts.getById.setData({ id: draftId }, (old) => {
        if (!old || !user) return old;
        return {
          ...old,
          readyCheck: {
            first_player_id: user.id,
            second_player_id: null,
          } as DraftReadyCheck,
        };
      });
    },
    onSuccess: ({ bothReady }) => {
      if (!bothReady) {
        toast.info(t("readyMarked"));
      }
      void utils.drafts.getById.invalidate({ id: draftId });
    },
    onError: (error) => {
      void utils.drafts.getById.invalidate({ id: draftId });
      toast.error(error.message || t("errorMarkingReady"));
    },
  });

  const cancelReadyMutation = api.draftReadyChecks.cancelReady.useMutation({
    onMutate: () => {
      utils.drafts.getById.setData({ id: draftId }, (old) => {
        if (!old) return old;
        return { ...old, readyCheck: undefined };
      });
    },
    onSuccess: () => {
      toast.info(t("readyCancelled"));
      void utils.drafts.getById.invalidate({ id: draftId });
    },
    onError: (error) => {
      void utils.drafts.getById.invalidate({ id: draftId });
      toast.error(error.message || t("errorCancellingReady"));
    },
  });

  const requestResetMutation = api.draftResetRequests.requestReset.useMutation({
    onSuccess: () => {
      toast.info(t("resetRequested"));
      void utils.drafts.getById.invalidate({ id: draftId });
    },
    onError: (error) => {
      toast.error(error.message || t("errorRequestingReset"));
    },
  });

  const cancelResetMutation = api.draftResetRequests.cancelReset.useMutation({
    onSuccess: () => {
      toast.info(t("resetCancelled"));
      void utils.drafts.getById.invalidate({ id: draftId });
    },
    onError: (error) => {
      toast.error(error.message || t("errorCancellingReset"));
    },
  });

  const acceptResetMutation = api.draftResetRequests.acceptReset.useMutation({
    onSuccess: () => {
      toast.success(t("resetAccepted"));
      setIsAccepted(true);
      void utils.drafts.getById.invalidate({ id: draftId });
    },
    onError: (error) => {
      toast.error(error.message || t("errorAcceptingReset"));
    },
  });

  const [isAccepted, setIsAccepted] = useState(false);

  const isResetPending = draftStatus === DRAFT_STATUS.RESET_REQUESTED;
  const isRequester = resetRequest?.requester_id === user?.id;
  const isRecipient = isResetPending && !isRequester;

  const isUserReady =
    readyCheck !== undefined &&
    (readyCheck.first_player_id === user?.id ||
      readyCheck.second_player_id === user?.id);

  if (isAccepted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Loader local width={100} height={100} />
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 mt-4">
      {/* Single ready toggle button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1">
              <Button
                onClick={() =>
                  isUserReady
                    ? cancelReadyMutation.mutate({ draft_id: draftId })
                    : markReadyMutation.mutate({ draft_id: draftId })
                }
                className={`w-full ${isUserReady ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                disabled={
                  markReadyMutation.isPending ||
                  cancelReadyMutation.isPending ||
                  (!isUserReady && (!canStartGame || isResetPending))
                }
              >
                {(markReadyMutation.isPending ||
                  cancelReadyMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUserReady ? t("readyConfirmed") : t("getReady")}
              </Button>
            </div>
          </TooltipTrigger>
          {!canStartGame && startGameRestrictionReason && (
            <TooltipContent>
              <p>{t(startGameRestrictionReason)}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {isResetPending && isRequester && (
        <Button
          onClick={() =>
            cancelResetMutation.mutate({ reset_request_id: resetRequest!.id })
          }
          variant="outline"
          className="flex-1"
          disabled={cancelResetMutation.isPending}
        >
          {cancelResetMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t("cancelReset")}
        </Button>
      )}

      {isRecipient && (
        <Button
          onClick={() =>
            acceptResetMutation.mutate({ reset_request_id: resetRequest!.id })
          }
          variant="destructive"
          className="flex-1"
          disabled={acceptResetMutation.isPending}
        >
          {acceptResetMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t("acceptReset")}
        </Button>
      )}

      {!isResetPending && (
        <Button
          onClick={() => requestResetMutation.mutate({ draft_id: draftId })}
          variant="outline"
          className="flex-1"
          disabled={requestResetMutation.isPending}
        >
          {requestResetMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t("requestReset")}
        </Button>
      )}
    </div>
  );
}
