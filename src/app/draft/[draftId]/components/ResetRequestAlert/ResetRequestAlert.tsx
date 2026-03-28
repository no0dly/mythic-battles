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

interface ResetRequestAlertProps {
  resetRequest: DraftResetRequest;
}

export function ResetRequestAlert({ resetRequest }: ResetRequestAlertProps) {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const utils = api.useUtils();
  const [isAccepted, setIsAccepted] = useState(false);

  const acceptResetMutation = api.draftResetRequests.acceptReset.useMutation({
    onSuccess: () => {
      toast.success(t("resetAccepted"));
      setIsAccepted(true);
      void utils.drafts.getById.invalidate({ id: resetRequest.draft_id });
    },
    onError: (error) => {
      toast.error(error.message || t("errorAcceptingReset"));
    },
  });

  const isRequester = resetRequest.requester_id === user?.id;

  if (isAccepted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Loader local width={100} height={100} />
      </div>
    );
  }

  if (isRequester) {
    return (
      <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800">
        <AlertTitle>{t("resetRequestedTitle")}</AlertTitle>
        <AlertDescription>{t("resetRequestedDescription")}</AlertDescription>
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
          <span>{t("resetRequestReceivedDescription")}</span>
          <Button
            size="lg"
            variant="destructive"
            className="cursor-pointer hover:brightness-110 transition-all shrink-0 -mt-4"
            onClick={() =>
              acceptResetMutation.mutate({ reset_request_id: resetRequest.id })
            }
            disabled={acceptResetMutation.isPending}
          >
            {acceptResetMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("acceptReset")}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
