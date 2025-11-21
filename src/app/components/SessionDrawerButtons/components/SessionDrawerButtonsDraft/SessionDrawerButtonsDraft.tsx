import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import { api } from "@/trpc/client";
import { useRouter } from "next/navigation";

interface SessionDrawerButtonsDraftProps {
  session: SessionWithPlayers;
}

export default function SessionDrawerButtonsDraft({
  session,
}: SessionDrawerButtonsDraftProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const lastGame = session.game_list?.[session.game_list.length - 1];
  const { data: draftId, isLoading } = api.games.getGameDetails.useQuery(
    { gameId: lastGame ?? "" },
    { enabled: !!lastGame, select: (data) => data.draft?.id }
  );

  const goToDraftHandler = () => {
    router.push(`/draft/${draftId}`);
  };

  return (
    <Button
      onClick={goToDraftHandler}
      variant="default"
      size="lg"
      loading={isLoading}
      className="whitespace-nowrap w-full"
      disabled={!draftId}
    >
      {t("goToDraft")}
    </Button>
  );
}
