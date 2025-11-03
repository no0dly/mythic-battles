import { Badge } from "@/components/ui/badge";
import { GAME_STATUS_CONFIG, type GameStatus } from "./constants";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import SessionModal from "../SessionModal";

const sessions: Array<{
  id: number;
  match: string;
  score: string;
  status: GameStatus;
}> = [
  { id: 1, match: "Igor vs Vlad", score: "5-0", status: "available" },
  { id: 2, match: "Igor vs Bed", score: "0-5", status: "finished" },
  { id: 3, match: "Alex vs Sam", score: "2-2", status: "draft" },
  { id: 4, match: "Max vs John", score: "3-1", status: "inProgress" },
];

function SessionsCard() {
  const { t } = useTranslation();
  const [selectedSessionID, setSelectedSessionID] = useState<number | null>(
    null
  );

  const onSelectSessionHandler = (id: number) => () => {
    setSelectedSessionID(id);
  };

  const onClearSessionHandler = () => {
    setSelectedSessionID(null);
  };

  return (
    <div className="relative group w-fit min-w-[320px]">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative border-2 border-foreground rounded-2xl p-3 md:p-4 bg-background transition-shadow duration-300">
        <ul className="space-y-2">
          {sessions.map(({ id, match, score, status }) => {
            return (
              <li
                key={id}
                role="button"
                onClick={onSelectSessionHandler(id)}
                className="group/session flex items-center justify-between p-2 rounded-lg hover:bg-gray-500/10 transition-colors duration-200 gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-foreground group-hover/session:text-gray-600 transition-colors">
                    {match}
                  </span>
                  <span className="font-bold text-emerald-600 text-xs">
                    ({score})
                  </span>
                </div>
                <Badge variant={GAME_STATUS_CONFIG[status].variant}>
                  {t(GAME_STATUS_CONFIG[status].label)}
                </Badge>
              </li>
            );
          })}
        </ul>
      </div>
      <SessionModal
        sessionID={selectedSessionID}
        clearSession={onClearSessionHandler}
      />
    </div>
  );
}

export default SessionsCard;
