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

export default function CardGalleryItem({
  item,
  onCardClickHandler,
}: {
  item: CardType;
  onCardClickHandler: () => void;
}) {
  const {
    unit_name: name,
    unit_type: unitType,
    cost,
    image_url: imageUrl,
  } = item;

  return (
    <button type="button" className="text-left" onClick={onCardClickHandler}>
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
          <div className="flex items-center justify-center h-full w-full">
            <Image
              src={imageUrl}
              alt={name}
              width={271}
              height={182}
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
