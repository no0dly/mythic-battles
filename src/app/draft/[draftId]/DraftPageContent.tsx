"use client";

import { useTranslation } from "react-i18next";
import { api } from "@/trpc/client";
import Loader from "@/components/Loader";
import { useParams } from "next/navigation";

export default function DraftPageContent() {
  const { t } = useTranslation();
  const { draftId } = useParams<{ draftId: string }>();

  const {
    data: draft,
    isLoading,
    error,
  } = api.drafts.getById.useQuery(
    {
      id: draftId,
    },
    {
      enabled: !!draftId,
    }
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error || !draft || !draftId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold mb-2">
            {t("error")}
          </p>
          <p className="text-muted-foreground">
            {error?.message || t("draftNotFound")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-xl font-semibold mb-4">{t("draftDetails")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {t("draftStatus")}
            </p>
            <p className="font-medium">{draft.draft_status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {t("currentTurn")}
            </p>
            <p className="font-medium">
              {draft.current_turn_user_id === draft.player1_id
                ? t("player1")
                : t("player2")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
