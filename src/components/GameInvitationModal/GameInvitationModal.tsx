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
import type { GameInvitation } from "@/types/database.types";

interface GameInvitationModalProps {
  invitation: GameInvitation | null;
  inviterName: string;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export const GameInvitationModal = ({
  invitation,
  inviterName,
  onAccept,
  onReject,
  isLoading = false,
}: GameInvitationModalProps) => {
  const { t } = useTranslation();

  if (!invitation) return null;

  return (
    <Dialog open={!!invitation} onOpenChange={() => onReject()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("gameInvitation")}</DialogTitle>
          <DialogDescription>
            {t("invitationFromPlayer", { player: inviterName })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {invitation.message && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">{invitation.message}</p>
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {t("acceptInvitationQuestion")}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onReject}
            disabled={isLoading}
          >
            {t("reject")}
          </Button>
          <Button
            onClick={onAccept}
            disabled={isLoading}
          >
            {t("accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

