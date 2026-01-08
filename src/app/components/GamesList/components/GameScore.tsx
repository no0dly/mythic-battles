import { useTranslation } from "react-i18next";
import type { WinCondition } from "@/types/database.types";

interface GameScoreProps {
  winnerName: string | null;
  winCondition: WinCondition | null;
}

export const GameScore = ({ winnerName, winCondition }: GameScoreProps) => {
  const { t } = useTranslation();

  return winnerName ? (
    <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
      <div className="mt-4 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {winCondition
            ? t("wonBy", {
                name: winnerName,
                winCondition: t(`winConditionOptions.${winCondition}`),
              })
            : `${winnerName} ${t("won")}`}
        </span>
      </div>
    </div>
  ) : null;
};
