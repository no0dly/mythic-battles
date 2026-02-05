"use client";

import type { Card } from "@/types/database.types";
import { CardImage } from "@/app/components/DraftInfo/components";
import { useTranslation } from "react-i18next";

type PlayerSectionColor = "blue" | "green";

const sectionAccentStyles: Record<
  PlayerSectionColor,
  { border: string; badge: string; title: string }
> = {
  blue: {
    border: "border-blue-200 bg-blue-50/70",
    badge: "bg-blue-100 text-blue-700",
    title: "text-blue-900",
  },
  green: {
    border: "border-green-200 bg-green-50/70",
    badge: "bg-green-100 text-green-700",
    title: "text-green-900",
  },
};

interface PlayerSectionProps {
  name: string;
  cards: Card[];
  totalCost: number;
  accent: PlayerSectionColor;
  onCardClick: (card: Card) => void;
}

export const PlayerSection = ({
  name,
  cards,
  totalCost,
  accent,
  onCardClick,
}: PlayerSectionProps) => {
  const { t } = useTranslation();
  const accentStyles = sectionAccentStyles[accent];

  const totalStrategicValue = cards.reduce(
    (sum, card) => sum + (card.strategic_value || 0),
    0
  );

  return (
    <div
      className={`rounded-2xl border-2 ${accentStyles.border} p-5 shadow-sm backdrop-blur`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {t("pickedCards")}
          </p>
          <h3 className={`text-xl font-semibold ${accentStyles.title}`}>
            {name}
          </h3>
          <p className="text-sm text-gray-600">
            {cards.length} {t("picks")}
          </p>
          <p className="text-sm text-gray-600">
            {t("strategicValue")}: {totalStrategicValue}
          </p>
        </div>
        <div
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${accentStyles.badge}`}
        >
          {t("totalCost")}: {totalCost}
        </div>
      </div>

      <div className="mt-5">
        {cards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-4 text-sm text-gray-500">
            {t("noCardsPicked")}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 pr-1">
            {cards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onCardClick(card)}
                className="min-w-[180px] rounded-xl border border-white/60 bg-white/90 p-3 text-left shadow-sm transition hover:border-purple-400 hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="relative mx-auto w-max">
                    <CardImage card={card} size="md" />
                    <span className="absolute left-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-purple-600 shadow">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {card.unit_name}
                      </p>
                      <span className="text-sm font-bold text-purple-600">
                        {t("cost")}: {card.cost}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t(`cardType.${card.unit_type}`)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
