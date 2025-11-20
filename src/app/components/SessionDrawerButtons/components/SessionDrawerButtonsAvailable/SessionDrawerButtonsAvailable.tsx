import { Button } from "@/components/ui/button";
import { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { api } from "@/trpc/client";
import { toast } from "sonner";

interface SessionDrawerButtonsAvailableProps {
  session: SessionWithPlayers;
  clearSession: () => void;
}

export default function SessionDrawerButtonsAvailable({
  session,
  clearSession,
}: SessionDrawerButtonsAvailableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const utils = api.useUtils();

  const hasGames = session.game_list && session.game_list.length > 0;

  const { mutate: finishSession, isPending: isFinishingSession } =
    api.sessions.finishSession.useMutation({
      onSuccess: () => {
        utils.sessions.invalidate();
        clearSession();
      },
      onError: (error) => {
        toast.error(error.message || t("errorFinishingSession"));
      },
    });

  const startNewGameHandler = () => {
    if (!session.id) return;
    router.push(`/draft-settings?sessionId=${session.id}`);
  };

  const finishHandler = () => {
    if (!session.id) return;
    finishSession({ sessionId: session.id });
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-col">
      <Button
        onClick={startNewGameHandler}
        variant="default"
        size="lg"
        className="whitespace-nowrap w-full"
        loading={isFinishingSession}
      >
        {t("startNewGame")}
      </Button>
      {hasGames && (
        <Button
          onClick={finishHandler}
          variant="outline"
          size="lg"
          className="whitespace-nowrap w-full"
          loading={isFinishingSession}
        >
          {t("finish")}
        </Button>
      )}
    </div>
  );
}
