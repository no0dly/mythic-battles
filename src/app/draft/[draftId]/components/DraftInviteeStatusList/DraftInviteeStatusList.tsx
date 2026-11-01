"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GameInvitation, GameInvitationStatus } from "@/types/database.types";
import { GAME_INVITATION_STATUS } from "@/types/constants";
import { api } from "@/trpc/client";
import { getPlayerName } from "@/utils/drafts/helpers";

interface DraftInviteeStatusListProps {
  invitations: GameInvitation[];
}

const STATUS_LABEL_KEYS: Record<GameInvitationStatus, string> = {
  [GAME_INVITATION_STATUS.PENDING]: "draftInviteeStatusPending",
  [GAME_INVITATION_STATUS.ACCEPTED]: "draftInviteeStatusAccepted",
  [GAME_INVITATION_STATUS.REJECTED]: "draftInviteeStatusRejected",
  [GAME_INVITATION_STATUS.CANCELLED]: "draftInviteeStatusCancelled",
  [GAME_INVITATION_STATUS.EXPIRED]: "draftInviteeStatusExpired",
};

function StatusIcon({ status }: { status: GameInvitationStatus }) {
  if (status === GAME_INVITATION_STATUS.ACCEPTED) {
    return <CheckCircle2 className="size-4 text-green-600" />;
  }
  if (status === GAME_INVITATION_STATUS.PENDING) {
    return <Clock className="size-4 text-amber-600" />;
  }
  return <XCircle className="size-4 text-red-600" />;
}

export function DraftInviteeStatusList({ invitations }: DraftInviteeStatusListProps) {
  const { t } = useTranslation();
  const inviteeIds = invitations.map((invitation) => invitation.invitee_id);
  const { data: invitees } = api.users.getUsersByIds.useQuery(
    { userIds: inviteeIds },
    { enabled: inviteeIds.length > 0 }
  );

  if (invitations.length === 0) return null;

  return (
    <ul className="mx-auto w-fit space-y-1 text-left" data-testid="draft-invitee-status-list">
      {invitations.map((invitation) => (
        <li key={invitation.id} className="flex items-center gap-2 text-sm">
          <StatusIcon status={invitation.status} />
          <span className="font-medium">
            {getPlayerName(invitees, invitation.invitee_id, "draftSeatFallbackName", t)}
          </span>
          <span className="text-muted-foreground">{t(STATUS_LABEL_KEYS[invitation.status])}</span>
        </li>
      ))}
    </ul>
  );
}
