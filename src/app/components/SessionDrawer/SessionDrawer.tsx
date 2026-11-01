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
import {
  getSessionGamesCount,
  isPracticeSession,
} from "@/utils/sessions/helpers";
import { getSessionScoreText, getSessionTitle } from "@/utils/sessions/multiplayer";
import { SessionModeBadge } from "../SessionModeBadge";

interface Props {
  session: SessionWithPlayers | null;
  clearSession: () => void;
}

export default function SessionDrawer({ session, clearSession }: Props) {
  const { t } = useTranslation();

  if (!session) {
    return null;
  }

  const practice = isPracticeSession(session);
  const gamesCount = getSessionGamesCount(session);

  const onOpenChangeHandler = (open: boolean) => {
    if (!open) {
      clearSession();
    }
  };

  return (
    <Drawer open={!!session} onOpenChange={onOpenChangeHandler}>
      <DrawerContent className="flex flex-col">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="flex flex-wrap items-center gap-2 text-2xl font-bold">
            <SessionModeBadge session={session} className="text-sm" />
            <span className="break-words">
              {getSessionTitle(session, t)}{" "}
              {practice ? gamesCount : getSessionScoreText(session)}
            </span>
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
