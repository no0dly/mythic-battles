"use client";

import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Card as CardType } from "@/types/database.types";
import { BADGE_COLORS } from "@/app/wiki/components/CardGalleryItem/constants";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

interface DraftCardItemProps {
  card: CardType;
  onPick: (cardId: string) => void;
  onCardClick?: (card: CardType) => void;
  isPicked?: boolean;
  canPick?: boolean;
  isLoading?: boolean;
}

function DraftCardItem({
  card,
  onPick,
  onCardClick,
  isPicked = false,
  canPick = true,
  isLoading = false,
}: DraftCardItemProps) {
  const { t } = useTranslation();
  const {
    id,
    unit_name: name,
    unit_type: unitType,
    cost,
    image_url: imageUrl,
  } = card;

  const handlePick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canPick && !isPicked && !isLoading) {
      onPick(id);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking the pick button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    if (onCardClick && !isPicked) {
      onCardClick(card);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`h-full hover:shadow-sm transition-shadow py-2 gap-1 ${
        isPicked
          ? "opacity-50 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          : canPick || onCardClick
          ? "hover:shadow-lg cursor-pointer"
          : "opacity-60 cursor-not-allowed"
      }`}
    >
      <CardHeader className="px-2 py-1">
        <CardTitle className="text-sm leading-tight flex items-center justify-between gap-2">
          <span>
            {name} ({cost})
          </span>
          {!isPicked && canPick && (
            <Button
              onClick={handlePick}
              disabled={isLoading}
              size="icon"
              className="h-6 w-6 bg-green-600 hover:bg-green-700 rounded-full shadow-md flex-shrink-0 cursor-pointer"
              aria-label={t("pickCard")}
            >
              <Check className="h-3.5 w-3.5 text-white" />
            </Button>
          )}
          {isPicked && (
            <div className="h-6 w-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge
            style={{ backgroundColor: BADGE_COLORS[unitType] }}
            className="text-white text-[10px] font-medium uppercase px-1 py-0"
          >
            {t(`cardType.${unitType}`)}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-1">
        <div className="relative flex items-center justify-center w-full min-h-[180px]">
          <Image
            src={imageUrl}
            alt={name}
            fill
            loading="lazy"
            className="object-contain"
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Использовать более точное сравнение в memo
// Сравниваем только id карты и критичные для рендера свойства
// onPick и onCardClick стабильны благодаря useCallback в родителе
export default memo(DraftCardItem, (prevProps, nextProps) => {
  // Если изменился статус picked или canPick - нужен ререндер
  if (prevProps.isPicked !== nextProps.isPicked) return false;
  if (prevProps.canPick !== nextProps.canPick) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  
  // Если это та же карта по id - не рендерим
  // (визуальное содержимое карты не меняется)
  if (prevProps.card.id === nextProps.card.id) return true;
  
  // В остальных случаях - рендерим
  return false;
});
