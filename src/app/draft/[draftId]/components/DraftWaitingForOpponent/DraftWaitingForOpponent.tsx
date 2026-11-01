import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import type { GameInvitation } from "@/types/database.types";
import { DraftInviteeStatusList } from "../DraftInviteeStatusList";

interface DraftWaitingForOpponentProps {
  /** Multiplayer drafts list every invitee's response */
  invitations?: GameInvitation[];
}

function DraftWaitingForOpponent({ invitations }: DraftWaitingForOpponentProps = {}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center space-y-4">
        <Loader />
        <h2 className="text-2xl font-semibold">
          {invitations ? t("waitingForPlayers") : t("waitingForOpponent")}
        </h2>
        <p className="text-muted-foreground">
          {invitations ? t("waitingForPlayersDescription") : t("waitingForOpponentDescription")}
        </p>
        {invitations && <DraftInviteeStatusList invitations={invitations} />}
        <Badge variant="outline" className="text-lg px-4 py-2">
          {t("draftStatus")}: {t("waitingForAcceptance")}
        </Badge>
      </div>
    </div>
  );
}

export default DraftWaitingForOpponent;
