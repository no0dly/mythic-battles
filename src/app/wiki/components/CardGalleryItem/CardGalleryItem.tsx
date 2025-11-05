import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Card as CardType } from "@/types/database.types";
import { BADGE_COLORS } from "./constants";

interface CardGalleryItemProps {
  item: CardType;
  onCardClickHandler: () => void;
}

function CardGalleryItem({ item, onCardClickHandler }: CardGalleryItemProps) {
  const {
    unit_name: name,
    unit_type: unitType,
    cost,
    image_url: imageUrl,
  } = item;

  return (
    <button
      type="button"
      className="text-left w-full"
      onClick={onCardClickHandler}
      aria-label={`${name} - ${unitType} - Cost: ${cost}`}
    >
      <Card
        data-testid="card-item"
        className="h-full hover:shadow-sm transition-shadow py-2 gap-1"
      >
        <CardHeader className="px-2 py-1">
          <CardTitle className="text-base">
            {name} ({cost})
          </CardTitle>
          <CardDescription className="text-xs">
            <Badge
              style={{ backgroundColor: BADGE_COLORS[unitType] }}
              className="text-white text-xs font-medium uppercase"
            >
              {unitType}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 py-1">
          <div className="relative flex items-center justify-center h-full w-full min-h-[200px]">
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
    </button>
  );
}

export default memo(CardGalleryItem);
