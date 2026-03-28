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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { Card } from "@/types/database.types";
import { Check, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { api } from "@/trpc/client";
import { useParams } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { createOptimisticDraftUpdate, parseDraftHistory } from "@/utils/drafts/helpers";
import type { Draft } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { CardPreviewDialog } from "@/app/components/DraftInfo/components";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ConfirmCardPickModalProps {
  card: Card;
  disabled?: boolean;
  restrictionReason?: string;
  remainingPoints?: number;
}

export default function ConfirmCardPickModal({
  card,
  disabled = false,
  restrictionReason,
  remainingPoints = 0,
}: ConfirmCardPickModalProps) {
  const { t } = useTranslation();
  const { draftId } = useParams<{ draftId: string }>();
  const { user } = useUserProfile();
  const [isConfirmModalShown, setIsConfirmModalShown] = useState(false);
  const utils = api.useUtils();
  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  const companionId = card.extra?.brings;
  const { data: companionCard, isLoading: isCompanionLoading } = api.cards.getById.useQuery(
    { id: companionId! },
    { enabled: isConfirmModalShown && !!companionId }
  );

  const bringsWithData = card.extra?.bringsWith;
  const { data: bringsWithCard, isLoading: isBringsWithLoading } = api.cards.getById.useQuery(
    { id: bringsWithData?.id ?? "" },
    { enabled: isConfirmModalShown && !!bringsWithData }
  );

  // Derive picked card IDs for the current user to check if bringsWith is already picked
  const pickedCardIds = useMemo(() => {
    const draft = utils.drafts.getById.getData({ id: draftId });
    const picks = parseDraftHistory(draft?.draft_history)?.picks ?? [];
    return new Set(picks.map((p) => p.card_id));
  }, [utils, draftId, isConfirmModalShown]); // eslint-disable-line react-hooks/exhaustive-deps

  const isBringsWithAlreadyPicked = !!bringsWithData && pickedCardIds.has(bringsWithData.id);
  const hasSufficientPointsForBringsWith =
    !!bringsWithData && remainingPoints - card.cost >= bringsWithData.cost;

  const [includeBringsWith, setIncludeBringsWith] = useState(true);

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
            companionCardId: companionCard?.id,
            bringsWithCardId: variables.bringsWith?.card_id,
            bringsWithCost: variables.bringsWith?.cost,
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
      ...(includeBringsWith && bringsWithData && hasSufficientPointsForBringsWith && !isBringsWithAlreadyPicked
        ? { bringsWith: { card_id: bringsWithData.id, cost: bringsWithData.cost } }
        : {}),
    });
  };

  const handleSetPreviewCard = useCallback((card: Card | null) => {
    setPreviewCard(card);
  }, []);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={disabled ? undefined : onToggleChangeHandle(true)}
            disabled={isPending || disabled}
            size="icon"
            className={`h-6 w-6 rounded-full shadow-md flex-shrink-0 ${
              disabled
                ? "bg-red-600 hover:bg-red-700 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 cursor-pointer"
            }`}
            aria-label={
              disabled
                ? t(restrictionReason || "cannotPickCard")
                : t("pickCard")
            }
          >
            {disabled ? (
              <X className="h-3.5 w-3.5 text-white" />
            ) : (
              <Check className="h-3.5 w-3.5 text-white" />
            )}
          </Button>
        </TooltipTrigger>
        {disabled && restrictionReason && (
          <TooltipContent>
            <p>{t(restrictionReason)}</p>
          </TooltipContent>
        )}
      </Tooltip>
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
                    onClick={() => handleSetPreviewCard(card)}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{card.unit_name}</h3>
                  <Badge variant={card.unit_type}>
                    {t(`cardType.${card.unit_type}`)}
                  </Badge>
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

            {companionId && (
              isCompanionLoading
                ? <Skeleton className="mt-3 h-9 w-full rounded-md" />
                : companionCard && (
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-950">
                    <span className="text-amber-800 dark:text-amber-200">
                      {t("companionNotice", { name: companionCard.unit_name })}
                    </span>
                  </div>
                )
            )}

            {bringsWithData && (
              isBringsWithLoading
                ? <Skeleton className="mt-3 h-10 w-full rounded-md" />
                : bringsWithCard && (
                  <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-950">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-2 ${isBringsWithAlreadyPicked || !hasSufficientPointsForBringsWith ? "opacity-50" : ""}`}>
                          <Checkbox
                            id="brings-with-checkbox"
                            checked={includeBringsWith && !isBringsWithAlreadyPicked && hasSufficientPointsForBringsWith}
                            onCheckedChange={(checked: boolean) => setIncludeBringsWith(checked)}
                            disabled={isBringsWithAlreadyPicked || !hasSufficientPointsForBringsWith}
                          />
                          <Label htmlFor="brings-with-checkbox" className="text-sm text-blue-800 dark:text-blue-200 cursor-pointer">
                            {t("bringsWithCheckboxLabel", { name: bringsWithCard.unit_name, cost: bringsWithData.cost })}
                          </Label>
                        </div>
                      </TooltipTrigger>
                      {(isBringsWithAlreadyPicked || !hasSufficientPointsForBringsWith) && (
                        <TooltipContent>
                          <p>{t(isBringsWithAlreadyPicked ? "bringsWithAlreadyPicked" : "bringsWithNotEnoughPoints")}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                )
            )}

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

      <CardPreviewDialog
        card={previewCard}
        onClose={() => handleSetPreviewCard(null)}
      />
    </>
  );
}
