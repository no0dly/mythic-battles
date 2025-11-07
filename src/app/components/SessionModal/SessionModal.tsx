import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-1";
import SessionModalButtons from "../SessionModalButtons";
import { useTranslation } from "react-i18next";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import { api } from "@/trpc/client";
import type { ParsedGame } from "@/server/api/routers/sessions/types";
import { useMemo } from "react";
import Loader from "@/components/Loader";

interface Props {
  session: SessionWithPlayers | null;
  clearSession: () => void;
}

export default function SessionModal({ session, clearSession }: Props) {
  const { t } = useTranslation();

  const { data: gamesData, isLoading: gamesLoading } =
    api.games.getList.useQuery(
      { ids: session?.game_list || [] },
      {
        enabled:
          !!session && !!session.game_list && session?.game_list.length > 0,
      }
    );

  const games: ParsedGame[] = useMemo(() => {
    if (!gamesData || !session) return [];

    return gamesData
      .map((game) => {
        let result: "Won" | "Lost" | "Draw" = "Draw";
        if (game.winner_id) {
          if (game.winner_id === session.player1_id) {
            result = "Won";
          } else if (game.winner_id === session.player2_id) {
            result = "Lost";
          }
        }

        return {
          number: game.game_number,
          result,
          createdBy: game.created_by,
          details: {
            // Note: player scores, duration, and rounds are not available in the Game table
            player1Score: 0,
            player2Score: 0,
          },
        };
      })
      .sort((a, b) => a.number - b.number);
  }, [gamesData, session]);

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
            {`${session.player1_score}-${session.player2_score}`}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {t("sessionDetails")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden px-6">
          <div className="space-y-4 h-full flex flex-col min-w-0">
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <h3 className="text-lg font-semibold mb-2">
                {t("sessionDetails")}
              </h3>
              <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain min-w-0">
                {gamesLoading ? (
                  <div className="text-sm text-muted-foreground">
                    <Loader local />
                  </div>
                ) : games.length > 0 ? (
                  <Accordion type="multiple" className="w-full min-w-0">
                    {games?.map((game) => (
                      <AccordionItem
                        key={game.number}
                        value={`game-${game.number}`}
                      >
                        <AccordionTrigger>
                          <span className="text-sm">
                            {t("game")} {game.number} -{" "}
                            {t(game.result.toLowerCase())}
                          </span>
                        </AccordionTrigger>
                        {game.details && (
                          <AccordionContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="font-semibold">
                                  {session.player1_name}
                                </span>
                                <span>{game.details.player1Score}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-semibold">
                                  {session.player2_name}
                                </span>
                                <span>{game.details.player2Score}</span>
                              </div>
                              {game.createdBy && (
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{t("createdBy")}:</span>
                                  <span>{game.createdBy}</span>
                                </div>
                              )}
                              <div className="pt-2 border-t space-y-1">
                                {game.details.duration && (
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t("duration")}:</span>
                                    <span>{game.details.duration}</span>
                                  </div>
                                )}
                                {game.details.rounds && (
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t("rounds")}:</span>
                                    <span>{game.details.rounds}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {t("noGamesYet")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <SessionModalButtons
            status={session.status}
            hasGames={games.length > 0}
            sessionID={session.id}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
