import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { GameStatus } from "@/types/database.types";

interface GameStatusBadgeProps {
  status: GameStatus;
}

export const GameStatusBadge = ({ status }: GameStatusBadgeProps) => {
  const { t } = useTranslation();

  return <Badge variant={status}>{t(status)}</Badge>;
};
