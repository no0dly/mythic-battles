"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { toast } from "sonner";

interface DraftActionButtonsProps {
  draftId: string;
}

export function DraftActionButtons({ draftId }: DraftActionButtonsProps) {
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
      <Button
        onClick={handleStartGame}
        className="flex-1"
        disabled={finishDraftMutation.isPending}
      >
        {t("startGame")}
      </Button>

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
