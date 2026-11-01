import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { formatDisplayName } from "@/utils/users";
import type { Card, UserSubset, DraftPick } from "@/types/database.types";
import { PlayerAvatar } from "./PlayerAvatar";
import { CardImage } from "./CardImage";
import { PLAYER_ACCENT_STYLES, type PlayerAccent } from "@/utils/drafts/playerAccents";

interface PickHistoryItemProps {
  pick: DraftPick;
  card: Card | undefined;
  user: UserSubset | undefined;
  isPlayer1: boolean;
  onCardClick: () => void;
  /** Overrides the player1/player2 colours, used by multiplayer drafts */
  accent?: PlayerAccent;
}

export const PickHistoryItem = ({
  pick,
  card,
  user,
  isPlayer1,
  onCardClick,
  accent,
}: PickHistoryItemProps) => {
  const { t } = useTranslation();
  const accentStyles = PLAYER_ACCENT_STYLES[accent ?? (isPlayer1 ? "blue" : "green")];

  const displayName = user
    ? formatDisplayName(user.display_name, user.email)
    : isPlayer1
    ? t("player1")
    : t("player2");

  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-3 shadow-sm transition-all ${accentStyles.historyRow}`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${accentStyles.historyBubble}`}
      >
        #{pick.pick_number}
      </div>

      <div className="hidden shrink-0 md:block">
        {user && <PlayerAvatar {...user} />}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`text-sm font-semibold ${accentStyles.title}`}
        >
          {displayName}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(pick.timestamp).toLocaleString()}
        </div>
      </div>

      <div className="flex-shrink-0">
        <CardImage card={card} onClick={onCardClick} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-800">
          {card?.unit_name || t("unknownCard")}
        </div>
        <div className="flex items-start flex-col">
          {card && (
            <>
              <Badge variant={card.unit_type} className="text-xs">
                {t(`cardType.${card.unit_type}`)}
              </Badge>
              <span className="text-sm font-bold text-purple-600">
                {t("cost")}: {pick.cost_override !== undefined ? (
                  <>{pick.cost_override} <span className="line-through text-gray-400 font-normal">({card.cost})</span></>
                ) : card.cost}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
