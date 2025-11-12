"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Card } from "@/types/database.types";
import { Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { api } from "@/trpc/client";
import { useParams } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { createOptimisticDraftUpdate } from "@/utils/drafts/helpers";
import type { Draft } from "@/types/database.types";

interface ConfirmCardPickModalProps {
  card: Card;
}

export default function ConfirmCardPickModal({
  card,
}: ConfirmCardPickModalProps) {
  const { t } = useTranslation();
  const { draftId } = useParams<{ draftId: string }>();
  const { user } = useUserProfile();
  const [isConfirmModalShown, setIsConfirmModalShown] = useState(false);
  const utils = api.useUtils();

  const { mutate: mutatePickCard, isPending } = api.drafts.pickCard.useMutation(
    {
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await utils.drafts.getById.cancel({ id: draftId });

        const previousDraft = utils.drafts.getById.getData({ id: draftId });

        if (previousDraft && user) {
          const draft = previousDraft as Draft;
          const optimisticUpdate = createOptimisticDraftUpdate({
            draft,
            cardId: variables.card_id,
            playerId: user.id,
          });

          utils.drafts.getById.setData(
            { id: draftId },
            {
              ...draft,
              draft_history: optimisticUpdate.draft_history as never,
              current_turn_user_id: optimisticUpdate.current_turn_user_id,
            }
          );
        }

        return { previousDraft };
      },
      onSuccess: () => {
        toast.success(t("cardPickedSuccessfully"));
        setIsConfirmModalShown(false);

        void utils.drafts.getById.invalidate({ id: draftId });
      },
      onError: (error, _variables, context) => {
        // Rollback to previous value on error
        if (context?.previousDraft) {
          utils.drafts.getById.setData({ id: draftId }, context.previousDraft);
        }
        toast.error(error.message || t("errorPickingCard"));
      },
    }
  );

  const onToggleChangeHandle = (value: boolean) => () => {
    setIsConfirmModalShown(value);
  };

  const onConfirmHandle = () => {
    mutatePickCard({
      draft_id: draftId,
      card_id: card.id,
    });
  };

  return (
    <>
      <Button
        onClick={onToggleChangeHandle(true)}
        disabled={isPending}
        size="icon"
        className="h-6 w-6 bg-green-600 hover:bg-green-700 rounded-full shadow-md flex-shrink-0 cursor-pointer"
        aria-label={t("pickCard")}
      >
        <Check className="h-3.5 w-3.5 text-white" />
      </Button>
      <Dialog
        open={isConfirmModalShown}
        onOpenChange={onToggleChangeHandle(false)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("confirmCardPick")}</DialogTitle>
            <DialogDescription>
              {t("confirmCardPickDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg border-2 border-primary p-4">
              <div className="flex items-start gap-4">
                {card.image_url && (
                  <Image
                    src={card.image_url}
                    alt={card.unit_name}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{card.unit_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`cardType.${card.unit_type}`)}
                  </p>
                  <div className="mt-2 flex gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("cost")}:
                      </span>
                      <span className="ml-1 font-semibold">{card.cost}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("strategicValue")}:
                      </span>
                      <span className="ml-1 font-semibold">
                        {card.strategic_value}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {t("areYouSurePickCard")}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onToggleChangeHandle(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={onConfirmHandle} loading={isPending}>
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
