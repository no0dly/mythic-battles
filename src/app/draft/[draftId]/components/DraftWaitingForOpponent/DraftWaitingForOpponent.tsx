import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";

function DraftWaitingForOpponent() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center space-y-4">
        <Loader />
        <h2 className="text-2xl font-semibold">{t("waitingForOpponent")}</h2>
        <p className="text-muted-foreground">
          {t("waitingForOpponentDescription")}
        </p>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {t("draftStatus")}: {t("waitingForAcceptance")}
        </Badge>
      </div>
    </div>
  );
}

export default DraftWaitingForOpponent;
