"use client";

import { memo, useState } from "react";
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
import { Check, Clock } from "lucide-react";
import CardGalleryModal from "@/app/wiki/components/CardGalleryModal";
import ConfirmCardPickModal from "../ConfirmCardPickModal";

interface DraftCardItemProps {
  card: CardType;
  isPicked?: boolean;
  isCurrentUserTurn: boolean;
}

function DraftCardItem({
  card,
  isPicked = false,
  isCurrentUserTurn,
}: DraftCardItemProps) {
  const { t } = useTranslation();
  const {
    unit_name: name,
    unit_type: unitType,
    cost,
    image_url: imageUrl,
  } = card;
  const [isModalShown, setIsModalShown] = useState(false);

  const handleToggleModal = (value: boolean) => () => {
    setIsModalShown(value);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking the pick button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    handleToggleModal(true)();
  };

  const handleCloseModal = () => {
    setIsModalShown(false);
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className={`h-full hover:shadow-sm transition-shadow py-2 gap-1 cursor-pointer ${
          isPicked
            ? "opacity-50 bg-gray-100 dark:bg-gray-800 border-2 border-blue-500"
            : isCurrentUserTurn
            ? "hover:shadow-lg"
            : "opacity-60"
        }`}
      >
        <CardHeader className="px-2 py-1">
          <CardTitle className="text-sm leading-tight flex items-center justify-between gap-2">
            <span>
              {name} ({cost})
            </span>
            {!isPicked && isCurrentUserTurn && (
              <ConfirmCardPickModal card={card} />
            )}
            {!isPicked && !isCurrentUserTurn && (
              <Button
                size="icon"
                className="h-6 w-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                aria-label={t("pickCard")}
                disabled
              >
                <Clock className="h-3.5 w-3.5 text-white" />
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

      <CardGalleryModal
        isShown={isModalShown}
        card={card}
        onCloseModal={handleCloseModal}
      />
    </>
  );
}

export default memo(DraftCardItem, (prevProps, nextProps) => {
  if (prevProps.isPicked !== nextProps.isPicked) return false;
  if (prevProps.isCurrentUserTurn !== nextProps.isCurrentUserTurn) return false;
  if (prevProps.card.id === nextProps.card.id) return true;

  return false;
});
