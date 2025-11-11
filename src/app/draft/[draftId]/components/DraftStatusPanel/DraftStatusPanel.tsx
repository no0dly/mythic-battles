"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import type { Draft, Card as CardType } from "@/types/database.types";
import { parseDraftHistory } from "@/utils/drafts/helpers";

interface DraftStatusPanelProps {
  draft: Draft;
  player1Name: string;
  player2Name: string;
  player1Cards: CardType[];
  player2Cards: CardType[];
  playerAllowedPoints: number;
  currentUserId: string;
}

export function DraftStatusPanel({
  draft,
  player1Name,
  player2Name,
  player1Cards,
  player2Cards,
  playerAllowedPoints,
  currentUserId,
}: DraftStatusPanelProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Мутация завершения драфта
  const finishDraftMutation = api.drafts.finishDraft.useMutation({
    onSuccess: () => {
      toast.success(t("draftFinished"));
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || t("errorFinishingDraft"));
    },
  });

  // Мутация запроса сброса
  const requestResetMutation = api.drafts.requestReset.useMutation({
    onSuccess: () => {
      toast.info(t("resetRequested"));
    },
    onError: (error) => {
      toast.error(error.message || t("errorRequestingReset"));
    },
  });

  const handleStartGame = () => {
    finishDraftMutation.mutate({ draft_id: draft.id });
  };

  const handleRequestReset = () => {
    requestResetMutation.mutate({ draft_id: draft.id });
  };

  const draftHistory = parseDraftHistory(draft.draft_history);
  const picks = draftHistory?.picks || [];

  // Parse initial roll
  let firstUserRoll = 0;
  let secondUserRoll = 0;
  if (draft.initial_roll && Array.isArray(draft.initial_roll)) {
    const initialRoll = draft.initial_roll as Array<{
      userID: string;
      roll: number;
    }>;
    const roll1 = initialRoll.find((r) => r.userID === draft.player1_id);
    const roll2 = initialRoll.find((r) => r.userID === draft.player2_id);
    firstUserRoll = roll1?.roll || 0;
    secondUserRoll = roll2?.roll || 0;
  }

  // Calculate remaining points for each player
  const player1Spent = player1Cards.reduce((sum, card) => sum + card.cost, 0);
  const player2Spent = player2Cards.reduce((sum, card) => sum + card.cost, 0);
  const player1Remaining = playerAllowedPoints - player1Spent;
  const player2Remaining = playerAllowedPoints - player2Spent;

  // Determine current turn
  const isPlayer1Turn = draft.current_turn_user_id === draft.player1_id;
  const isPlayer2Turn = draft.current_turn_user_id === draft.player2_id;

  // Calculate turn number (each pick is a turn)
  const turnNumber = picks.length + 1;

  // Calculate draft round (each round has 2 picks - one per player)
  const draftRound = Math.ceil(turnNumber / 2);

  // Determine player status
  const player1Status = isPlayer1Turn ? t("picking") : t("awaits");
  const player2Status = isPlayer2Turn ? t("picking") : t("awaits");

  return (
    <div className="space-y-4">
      <div className="space-y-1 mb-3 pb-4">
        <p>
          {t("initialRoll")} {firstUserRoll}-{secondUserRoll}
        </p>
        <p>
          {t("draftRound")} {draftRound}
        </p>
      </div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-sm">
            {player1Name} {player1Status}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("availablePoints")} ({player1Remaining})
          </p>
        </div>
        <div
          className={`border-2 rounded-lg p-2 h-[20vh] flex flex-col ${
            isPlayer1Turn ? "border-green-500" : "border-gray-300"
          }`}
        >
          <p className="text-xs font-semibold mb-1 flex-shrink-0">
            {t("pickedCards")}
          </p>
          <div className="flex-1 overflow-y-auto space-y-1">
            {player1Cards.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("noCardsPicked")}
              </p>
            ) : (
              player1Cards.map((card, index) => (
                <p key={card.id} className="text-xs">
                  {index + 1} {card.unit_name} -{" "}
                  {t(`cardType.${card.unit_type}`)}, {card.cost}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-sm">
            {player2Name} {player2Status}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("availablePoints")} ({player2Remaining})
          </p>
        </div>
        <div
          className={`border-2 rounded-lg p-2 h-[20vh] flex flex-col ${
            isPlayer2Turn ? "border-green-500" : "border-gray-300"
          }`}
        >
          <p className="text-xs font-semibold mb-1 flex-shrink-0">
            {t("pickedCards")}
          </p>
          <div className="flex-1 overflow-y-auto space-y-1">
            {player2Cards.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("noCardsPicked")}
              </p>
            ) : (
              player2Cards.map((card, index) => (
                <p key={card.id} className="text-xs">
                  {index + 1} {card.unit_name} -{" "}
                  {t(`cardType.${card.unit_type}`)}, {card.cost}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
