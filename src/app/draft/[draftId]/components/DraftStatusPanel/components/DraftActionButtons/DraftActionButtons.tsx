"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DraftActionButtonsProps {
  draftId: string;
  canStartGame?: boolean;
  startGameRestrictionReason?: string;
}

export function DraftActionButtons({ 
  draftId,
  canStartGame = true,
  startGameRestrictionReason,
}: DraftActionButtonsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const finishDraftMutation = api.drafts.finishDraft.useMutation({
    onSuccess: () => {
      toast.success(t("draftFinished"));
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || t("errorFinishingDraft"));
    },
  });

  const requestResetMutation = api.drafts.requestReset.useMutation({
    onSuccess: () => {
      toast.info(t("resetRequested"));
    },
    onError: (error) => {
      toast.error(error.message || t("errorRequestingReset"));
    },
  });

  const handleStartGame = () => {
    finishDraftMutation.mutate({ draft_id: draftId });
  };

  const handleRequestReset = () => {
    requestResetMutation.mutate({ draft_id: draftId });
  };

  return (
    <div className="flex flex-row gap-2 mt-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1">
              <Button
                onClick={handleStartGame}
                className="w-full"
                disabled={finishDraftMutation.isPending || !canStartGame}
              >
                {t("startGame")}
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

      <Button
        onClick={handleRequestReset}
        variant="outline"
        className="flex-1"
        disabled={requestResetMutation.isPending}
      >
        {t("requestReset")}
      </Button>
    </div>
  );
}
