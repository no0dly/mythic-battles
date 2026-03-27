import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { TalentBadges } from "@/components/TalentBadges";
import { ClassBadges } from "@/components/ClassBadges";
import { OriginBadge } from "@/components/OriginBadge";
import type { Card } from "@/types/database.types";

interface CardPreviewContentProps {
  card: Card;
}

export function CardPreviewContent({ card }: CardPreviewContentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full">
        <Image
          src={card.image_url}
          alt={card.unit_name}
          width={900}
          height={900}
          className="w-full h-auto rounded-lg shadow-2xl"
        />
      </div>
      <div className="w-full rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-2xl font-bold text-foreground">
              {card.unit_name}
            </h3>
            <div className="flex items-center gap-3">
              <Badge variant={card.unit_type}>
                {t(`cardType.${card.unit_type}`)}
              </Badge>
              <span className="text-lg font-semibold text-muted-foreground">
                {t("cost")}: {card.cost}
              </span>
            </div>
          </div>
          <ClassBadges classes={card.class} />
          <OriginBadge origin={card.origin} />
          <TalentBadges talents={card.talents ?? []} />
        </div>
      </div>
    </div>
  );
}
