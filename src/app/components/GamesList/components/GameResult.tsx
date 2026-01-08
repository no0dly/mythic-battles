import { useTranslation } from "react-i18next";

interface GameResultProps {
  winnerId: string | null;
  currentPlayerId: string;
}

export const GameResult = ({ winnerId, currentPlayerId }: GameResultProps) => {
  const { t } = useTranslation();

  if (!winnerId || !currentPlayerId) {
    return null;
  }

  if (winnerId === currentPlayerId) {
    return <span className="font-medium text-green-600">{t("won")}</span>;
  }

  return <span className="font-medium text-red-600">{t("lost")}</span>;
};
