import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import SessionDrawerButtons from "../SessionDrawerButtons";
import { useTranslation } from "react-i18next";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import { GamesList } from "../GamesList";

interface Props {
  session: SessionWithPlayers | null;
  clearSession: () => void;
}

export default function SessionDrawer({ session, clearSession }: Props) {
  const { t } = useTranslation();

  if (!session) {
    return null;
  }

  const onOpenChangeHandler = (open: boolean) => {
    if (!open) {
      clearSession();
    }
  };

  return (
    <Drawer open={!!session} onOpenChange={onOpenChangeHandler}>
      <DrawerContent className="flex flex-col">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-2xl font-bold">
            {t("playedVSPlayer", {
              player1: session.player1_name,
              player2: session.player2_name,
            })}{" "}
            {`${session.player1_session_score}-${session.player2_session_score}`}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {t("sessionDetails")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <GamesList session={session} />
        </div>
        <DrawerFooter>
          <SessionDrawerButtons session={session} clearSession={clearSession} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
