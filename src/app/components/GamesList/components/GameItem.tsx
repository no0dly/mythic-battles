import { useTranslation } from "react-i18next";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion-1";
import type { GameWithDraft } from "@/server/api/routers/games/types";
import { DraftInfo } from "../../DraftInfo";
import { GameStatusBadge } from "./GameStatusBadge";
import { GameResult } from "./GameResult";
import { GameScore } from "./GameScore";
import { GameMetadata } from "./GameMetadata";

interface GameItemProps {
  game: GameWithDraft;
  player1Id: string;
  player1Name: string;
  player2Name: string;
  index: number;
}

export const GameItem = ({
  game,
  player1Id,
  player1Name,
  player2Name,
  index,
}: GameItemProps) => {
  const { t } = useTranslation();

  return (
    <AccordionItem
      value={game.id}
      className="animate-slide-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <AccordionTrigger className="hover:bg-gray-50 transition-all duration-200 rounded-lg px-4">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-sm">
              {game.game_number}
            </div>
            <span className="font-semibold text-gray-800">
              {t("game")} #{game.game_number}
            </span>
            <GameStatusBadge status={game.status} />
          </div>
          <div className="flex items-center gap-2">
            <GameResult winnerId={game.winner_id} currentPlayerId={player1Id} />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-2 animate-slide-in-down">
          <GameScore
            player1Name={player1Name}
            player2Name={player2Name}
            player1Id={player1Id}
            winnerId={game.winner_id}
          />

          <DraftInfo
            draft={
              game.draft
                ? {
                    id: game.draft.id,
                    draft_status: game.draft.draft_status,
                    draft_history: game.draft.parsed_draft_history,
                    player1_id: game.draft.player1_id,
                    player2_id: game.draft.player2_id,
                    draft_total_cost: game.draft_settings?.draft_size,
                  }
                : null
            }
            player1Name={player1Name}
            player2Name={player2Name}
          />

          <GameMetadata
            createdAt={game.created_at}
            finishedAt={game.finished_at}
            createdBy={game.created_by_name}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
