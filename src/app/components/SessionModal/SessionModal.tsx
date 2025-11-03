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
import type { GameStatus } from "../SessionsCard/constants";
import { useTranslation } from "react-i18next";

interface Props {
  sessionID: number | null;
  clearSession: () => void;
}

// Mock session data - in production this would come from an API
const getSessionData = (id: number | null) => {
  if (!id) return null;

  const sessions: Record<
    number,
    {
      match: string;
      score: string;
      status: GameStatus;
      games: Array<{
        number: number;
        result: "Won" | "Lost" | "Draw";
        details?: {
          player1Score: number;
          player2Score: number;
          duration?: string;
          rounds?: number;
        };
      }>;
      drafts: {
        player1: string;
        player2: string;
      };
    }
  > = {
    1: {
      match: "Igor vs Vlad",
      score: "5-0",
      status: "available",
      games: [
        {
          number: 1,
          result: "Won",
          details: {
            player1Score: 20,
            player2Score: 15,
            duration: "45 minutes",
            rounds: 8,
          },
        },
        {
          number: 2,
          result: "Lost",
          details: {
            player1Score: 12,
            player2Score: 18,
            duration: "38 minutes",
            rounds: 6,
          },
        },
        {
          number: 3,
          result: "Won",
          details: {
            player1Score: 25,
            player2Score: 20,
            duration: "52 minutes",
            rounds: 9,
          },
        },
      ],
      drafts: {
        player1: "Igor's Draft",
        player2: "Vlad Draft",
      },
    },
    2: {
      match: "Igor vs Bed",
      score: "0-5",
      status: "finished",
      games: [
        {
          number: 1,
          result: "Lost",
          details: {
            player1Score: 10,
            player2Score: 22,
            duration: "40 minutes",
            rounds: 7,
          },
        },
        {
          number: 2,
          result: "Lost",
          details: {
            player1Score: 14,
            player2Score: 19,
            duration: "35 minutes",
            rounds: 6,
          },
        },
        {
          number: 3,
          result: "Lost",
          details: {
            player1Score: 11,
            player2Score: 21,
            duration: "42 minutes",
            rounds: 7,
          },
        },
      ],
      drafts: {
        player1: "Igor's Draft",
        player2: "Bed Draft",
      },
    },
    3: {
      match: "Alex vs Sam",
      score: "2-2",
      status: "draft",
      games: [
        {
          number: 1,
          result: "Won",
          details: {
            player1Score: 18,
            player2Score: 16,
            duration: "48 minutes",
            rounds: 8,
          },
        },
        {
          number: 2,
          result: "Lost",
          details: {
            player1Score: 13,
            player2Score: 17,
            duration: "39 minutes",
            rounds: 6,
          },
        },
      ],
      drafts: {
        player1: "Alex's Draft",
        player2: "Sam Draft",
      },
    },
    4: {
      match: "Max vs John",
      score: "3-1",
      status: "inProgress",
      games: [
        {
          number: 1,
          result: "Won",
          details: {
            player1Score: 19,
            player2Score: 14,
            duration: "44 minutes",
            rounds: 7,
          },
        },
        {
          number: 2,
          result: "Lost",
          details: {
            player1Score: 15,
            player2Score: 20,
            duration: "46 minutes",
            rounds: 8,
          },
        },
        {
          number: 3,
          result: "Won",
          details: {
            player1Score: 22,
            player2Score: 18,
            duration: "50 minutes",
            rounds: 9,
          },
        },
        {
          number: 4,
          result: "Won",
          details: {
            player1Score: 21,
            player2Score: 16,
            duration: "47 minutes",
            rounds: 8,
          },
        },
      ],
      drafts: {
        player1: "Max's Draft",
        player2: "John Draft",
      },
    },
  };

  return sessions[id] || null;
};

export default function SessionModal({ sessionID, clearSession }: Props) {
  const { t } = useTranslation();
  const onOpenChangeHandler = (open: boolean) => {
    if (!open) {
      clearSession();
    }
  };

  const sessionData = getSessionData(sessionID);

  if (!sessionData) {
    return null;
  }

  return (
    <Drawer open={!!sessionID} onOpenChange={onOpenChangeHandler}>
      <DrawerContent className="flex flex-col">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-2xl font-bold">
            {sessionData.match} {sessionData.score}
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
                <Accordion type="multiple" className="w-full min-w-0">
                  {sessionData.games.map((game) => (
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
                                {sessionData.match.split(" vs ")[0]}
                              </span>
                              <span>{game.details.player1Score}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">
                                {sessionData.match.split(" vs ")[1]}
                              </span>
                              <span>{game.details.player2Score}</span>
                            </div>
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
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <SessionModalButtons
            status={sessionData.status}
            hasGames={sessionData.games.length > 0}
            sessionID={sessionID}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
