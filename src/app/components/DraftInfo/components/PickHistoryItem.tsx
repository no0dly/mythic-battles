import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { formatDisplayName } from "@/utils/users";
import type { Card, UserProfile, DraftPick } from "@/types/database.types";
import { PlayerAvatar } from "./PlayerAvatar";
import { CardImage } from "./CardImage";

type UserData = Pick<UserProfile, "id" | "email" | "display_name" | "avatar_url">;

interface PickHistoryItemProps {
  pick: DraftPick;
  card: Card | undefined;
  user: UserData | undefined;
  isPlayer1: boolean;
  onCardClick: () => void;
}

export const PickHistoryItem = ({
  pick,
  card,
  user,
  isPlayer1,
  onCardClick,
}: PickHistoryItemProps) => {
  const { t } = useTranslation();

  const displayName = user
    ? formatDisplayName(user.display_name, user.email)
    : isPlayer1
    ? t("player1")
    : t("player2");

  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-3 shadow-sm transition-all ${
        isPlayer1
          ? "border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100"
          : "border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100"
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${
          isPlayer1 ? "bg-blue-600" : "bg-green-600"
        }`}
      >
        #{pick.pick_number}
      </div>

      <div className="flex-shrink-0">
        {user && <PlayerAvatar {...user} />}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`text-sm font-semibold ${
            isPlayer1 ? "text-blue-900" : "text-green-900"
          }`}
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
                {card.unit_type}
              </Badge>
              <span className="text-sm font-bold text-purple-600">
                {t("cost")}: {card.cost}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

