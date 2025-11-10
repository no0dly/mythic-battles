import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { formatDisplayName } from "@/utils/users";
import type { Card, UserProfile } from "@/types/database.types";
import { PlayerAvatar } from "./PlayerAvatar";

type UserData = Pick<UserProfile, "id" | "email" | "display_name" | "avatar_url">;

interface PlayerCardsTabProps {
  user: UserData | undefined;
  playerCards: Card[];
  totalCost: number;
  fallbackName: string;
  borderColor: "blue" | "green";
  onCardClick: (card: Card) => void;
}

export const PlayerCardsTab = ({
  user,
  playerCards,
  totalCost,
  fallbackName,
  borderColor,
  onCardClick,
}: PlayerCardsTabProps) => {
  const { t } = useTranslation();

  const displayName = user
    ? formatDisplayName(user.display_name, user.email)
    : fallbackName;

  const colorClasses = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    green: "border-green-200 bg-green-50 text-green-900",
  };

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 rounded-lg border-2 ${colorClasses[borderColor]} p-4`}>
        {user && <PlayerAvatar {...user} />}
        <div>
          <div className={`font-semibold ${colorClasses[borderColor]}`}>
            {displayName}
          </div>
          <div className="text-sm text-gray-600">
            {playerCards.length} {t("cardsSelected")}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">
            {t("totalCost")}:
          </span>
          <span className="text-lg font-bold text-purple-700">{totalCost}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {playerCards.map((card) => (
            <div
              key={card.id}
              className="group relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-purple-400 hover:shadow-md"
            >
              <div className="mb-2 flex justify-center">
                <Image
                  src={card.image_url}
                  alt={card.unit_name}
                  width={120}
                  height={120}
                  className="h-24 w-24 cursor-pointer rounded-lg object-cover transition-transform hover:scale-105"
                  onClick={() => onCardClick(card)}
                />
              </div>
              <div className="space-y-1">
                <h4 className="truncate text-sm font-semibold text-gray-800">
                  {card.unit_name}
                </h4>
                <div className="flex items-center justify-between">
                  <Badge variant={card.unit_type} className="text-xs">
                    {card.unit_type}
                  </Badge>
                  <span className="text-sm font-bold text-purple-600">
                    {card.cost}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

