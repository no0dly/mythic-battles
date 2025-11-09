"use client";

import { useState } from "react";
import type { DraftHistory } from "@/types/database.types";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sortPicksByNumber, hasPicks } from "@/utils/drafts";
import { DraftHistoryModal } from "./DraftHistoryModal";
import { InitialRollDisplay, EmptyDraftState } from "./components";
import { ClipboardList } from "lucide-react";

interface DraftInfoProps {
  draft: {
    id: string;
    draft_status: string;
    draft_history: DraftHistory | null;
    player1_id: string;
    player2_id: string;
    draft_total_cost: number;
  } | null;
  player1Name: string;
  player2Name: string;
}

export const DraftInfo = ({
  draft,
  player1Name,
  player2Name,
}: DraftInfoProps) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!draft) {
    return <EmptyDraftState type="no_draft" />;
  }

  if (!hasPicks(draft.draft_history)) {
    return <EmptyDraftState type="no_picks" draftStatus={draft.draft_status} />;
  }

  const { picks, initial_roll } = draft.draft_history || { picks: [], initial_roll: null };
  const sortedPicks = sortPicksByNumber(picks);

  return (
    <div className="space-y-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-5 shadow-sm animate-scale-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-purple-600" />
          <h4 className="text-xs font-semibold text-gray-800">
            {t("draftInformation")}
          </h4>
        </div>
        <Badge
          variant="outline"
          className="border-purple-400 bg-purple-100 text-purple-800 font-semibold"
        >
          {draft.draft_status}
        </Badge>
      </div>

      {initial_roll && (
        <InitialRollDisplay
          player1Roll={initial_roll.player1_roll}
          player2Roll={initial_roll.player2_roll}
          player1Name={player1Name}
          player2Name={player2Name}
        />
      )}

      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">
            {t("draftTotalCost")}:
          </span>
        </div>
        <span className="text-lg font-bold text-gray-900">
          {draft.draft_total_cost}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-purple-600" />

            <span className="text-sm font-bold text-gray-800">
              {t("draftHistory")}
            </span>
          </div>
          <span className="rounded-full bg-purple-200 px-3 py-1 text-xs font-bold text-purple-800">
            {sortedPicks.length} {t("picks")}
          </span>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {t("viewDetailedHistory")}
        </Button>
      </div>

      <DraftHistoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        draftHistory={draft.draft_history}
        player1Id={draft.player1_id}
        player2Id={draft.player2_id}
        draftTotalCost={draft.draft_total_cost}
      />
    </div>
  );
};
