import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { GAME_MODE_LABEL_KEYS } from "@/types/constants";
import type { GameMode } from "@/types/database.types";
import { getDraftMode } from "@/utils/drafts/turnOrder";

interface SessionModeBadgeProps {
  session: { mode?: GameMode | null };
  className?: string;
}

export function SessionModeBadge({ session, className = "" }: SessionModeBadgeProps) {
  const { t } = useTranslation();
  const mode = getDraftMode(session);

  return (
    <Badge
      variant="outline"
      className={`shrink-0 font-semibold tabular-nums ${className}`}
      data-testid="session-mode-badge"
    >
      {t(GAME_MODE_LABEL_KEYS[mode])}
    </Badge>
  );
}
