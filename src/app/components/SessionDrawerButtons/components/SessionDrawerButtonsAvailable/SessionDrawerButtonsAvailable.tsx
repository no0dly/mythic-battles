import { Button } from "@/components/ui/button";
import { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface SessionDrawerButtonsAvailableProps {
  session: SessionWithPlayers;
}

export default function SessionDrawerButtonsAvailable({
  session,
}: SessionDrawerButtonsAvailableProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const hasGames = session.game_list && session.game_list.length > 0;

  const startNewGameHandler = () => {
    if (!session.id) return;
    router.push(`/draft-settings?sessionId=${session.id}`);
  };

  const finishHandler = () => {
    // TODO: Implement finish functionality
    console.log("Finish session", session.id);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        onClick={startNewGameHandler}
        variant="default"
        size="lg"
        className={
          hasGames ? "whitespace-nowrap flex-1" : "whitespace-nowrap w-full"
        }
      >
        {t("startNewGame")}
      </Button>
      {hasGames && (
        <Button
          onClick={finishHandler}
          variant="outline"
          size="lg"
          className="whitespace-nowrap flex-1"
        >
          {t("finish")}
        </Button>
      )}
    </div>
  );
}
