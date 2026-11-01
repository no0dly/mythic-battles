"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import type { DraftResetRequest } from "@/types/database.types";
import { useUserProfile } from "@/hooks/useUserProfile";
import Loader from "@/components/Loader";
import {
  getResetApproverIds,
  hasApprovedReset,
  isMultiplayerResetRequest,
} from "@/utils/drafts/resetRequests";

interface ResetRequestAlertProps {
  resetRequest: DraftResetRequest;
}

export function ResetRequestAlert({ resetRequest }: ResetRequestAlertProps) {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const utils = api.useUtils();
  const [isAccepted, setIsAccepted] = useState(false);

  const acceptResetMutation = api.draftResetRequests.acceptReset.useMutation({
    onSuccess: (result) => {
      if ("waitingForOthers" in result && result.waitingForOthers) {
        toast.info(t("resetApprovalRecorded"));
      } else {
        toast.success(t("resetAccepted"));
        setIsAccepted(true);
      }
      void utils.drafts.getById.invalidate({ id: resetRequest.draft_id });
    },
    onError: (error) => {
      toast.error(error.message || t("errorAcceptingReset"));
    },
  });

  const declineResetMutation = api.draftResetRequests.declineReset.useMutation({
    onSuccess: () => {
      toast.info(t("resetDeclined"));
      void utils.drafts.getById.invalidate({ id: resetRequest.draft_id });
    },
    onError: (error) => {
      toast.error(error.message || t("errorDecliningReset"));
    },
  });

  const isRequester = resetRequest.requester_id === user?.id;
  const isMultiplayer = isMultiplayerResetRequest(resetRequest);
  const approverIds = getResetApproverIds(resetRequest);
  const approvedCount = resetRequest.approved_ids?.length ?? 0;
  const hasUserApproved = !!user && hasApprovedReset(resetRequest, user.id);
  const approvalProgress = isMultiplayer && (
    <span className="block text-xs text-muted-foreground" data-testid="reset-approval-progress">
      {t("resetApprovalProgress", { approved: approvedCount, total: approverIds.length })}
    </span>
  );

  if (isAccepted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Loader local width={100} height={100} />
      </div>
    );
  }

  if (isRequester || hasUserApproved) {
    return (
      <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800">
        <AlertTitle>{t("resetRequestedTitle")}</AlertTitle>
        <AlertDescription>
          {isRequester ? t("resetRequestedDescription") : t("resetWaitingForOthers")}
          {approvalProgress}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800">
      <AlertTitle className="text-red-700 dark:text-red-300">
        ⚔️ {t("resetRequestReceivedTitle")}
      </AlertTitle>
      <AlertDescription>
        <div className="flex w-full items-center justify-between gap-4">
          <span>
            {t("resetRequestReceivedDescription")}
            {approvalProgress}
          </span>
          <div className="flex shrink-0 gap-2 -mt-4">
            {isMultiplayer && (
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  declineResetMutation.mutate({ reset_request_id: resetRequest.id })
                }
                disabled={declineResetMutation.isPending || acceptResetMutation.isPending}
              >
                {declineResetMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("declineReset")}
              </Button>
            )}
            <Button
              size="lg"
              variant="destructive"
              className="cursor-pointer hover:brightness-110 transition-all"
              onClick={() =>
                acceptResetMutation.mutate({ reset_request_id: resetRequest.id })
              }
              disabled={acceptResetMutation.isPending || declineResetMutation.isPending}
            >
              {acceptResetMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("acceptReset")}
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
