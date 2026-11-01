import { useTranslation } from "react-i18next";

interface GameResultProps {
  winnerId: string | null;
  currentPlayerId: string;
  /** Multiplayer: every winner (teammates win together) */
  winnerIds?: string[];
}

export const GameResult = ({ winnerId, currentPlayerId, winnerIds }: GameResultProps) => {
  const { t } = useTranslation();

  if (!winnerId || !currentPlayerId) {
    return null;
  }

  const isWinner = winnerIds?.length
    ? winnerIds.includes(currentPlayerId)
    : winnerId === currentPlayerId;

  if (isWinner) {
    return <span className="font-medium text-green-600">{t("won")}</span>;
  }

  return <span className="font-medium text-red-600">{t("lost")}</span>;
};
