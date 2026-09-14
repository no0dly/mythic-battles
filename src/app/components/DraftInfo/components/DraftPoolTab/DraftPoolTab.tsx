"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Card, DraftPick, UserSubset } from "@/types/database.types";
import { CARD_TYPES } from "@/types/constants";
import { DraftPoolPlayerRail, type DraftPoolRailPick } from "./DraftPoolPlayerRail";
import { DraftPoolCard } from "./DraftPoolCard";
import { DraftPoolInspector } from "./DraftPoolInspector";
import {
  INSPECT_SCROLL_DELAY_MS,
  draftPoolCardElementId,
} from "./constants";

interface DraftPoolTabProps {
  poolCards: Card[];
  picksByCardId: Map<string, DraftPick[]>;
  player1Picks: DraftPoolRailPick[];
  player2Picks: DraftPoolRailPick[];
  player1TotalCost: number;
  player2TotalCost: number;
  player1Id: string;
  player1: UserSubset | undefined;
  player2: UserSubset | undefined;
}

function sortPoolCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const aIsAoW = a.unit_type === CARD_TYPES.ART_OF_WAR;
    const bIsAoW = b.unit_type === CARD_TYPES.ART_OF_WAR;
    if (aIsAoW !== bIsAoW) {
      return aIsAoW ? 1 : -1;
    }
    return (
      a.unit_type.localeCompare(b.unit_type) ||
      a.unit_name.localeCompare(b.unit_name)
    );
  });
}

export function DraftPoolTab({
  poolCards,
  picksByCardId,
  player1Picks,
  player2Picks,
  player1TotalCost,
  player2TotalCost,
  player1Id,
  player1,
  player2,
}: DraftPoolTabProps) {
  const { t } = useTranslation();
  const inspectTimerRef = useRef<number | undefined>(undefined);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(
    null
  );
  const [inspectedCardId, setInspectedCardId] = useState<string | null>(null);
  const [focusedPickNumber, setFocusedPickNumber] = useState<number | null>(
    null
  );

  const sortedPoolCards = useMemo(() => sortPoolCards(poolCards), [poolCards]);

  const clearInspectTimer = useCallback(() => {
    if (inspectTimerRef.current !== undefined) {
      window.clearTimeout(inspectTimerRef.current);
      inspectTimerRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearInspectTimer();
    };
  }, [clearInspectTimer]);

  const inspectImmediately = useCallback(
    (cardId: string) => {
      clearInspectTimer();
      setHighlightedCardId(cardId);
      setFocusedPickNumber(null);
      setInspectedCardId(cardId);
    },
    [clearInspectTimer]
  );

  const scrollThenInspect = useCallback(
    (cardId: string, pickNumber: number) => {
      clearInspectTimer();
      setInspectedCardId(null);
      setHighlightedCardId(cardId);
      setFocusedPickNumber(pickNumber);

      requestAnimationFrame(() => {
        document
          .getElementById(draftPoolCardElementId(cardId))
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
      });

      inspectTimerRef.current = window.setTimeout(() => {
        setInspectedCardId(cardId);
      }, INSPECT_SCROLL_DELAY_MS);
    },
    [clearInspectTimer]
  );

  const closeInspector = useCallback(() => {
    clearInspectTimer();
    setInspectedCardId(null);
    setHighlightedCardId(null);
    setFocusedPickNumber(null);
  }, [clearInspectTimer]);

  const inspectedCard = inspectedCardId
    ? sortedPoolCards.find((card) => card.id === inspectedCardId)
    : undefined;
  const inspectedPicks = inspectedCardId
    ? (picksByCardId.get(inspectedCardId) ?? [])
    : [];
  const inspectorPicks =
    focusedPickNumber === null
      ? inspectedPicks
      : inspectedPicks.filter((pick) => pick.pick_number === focusedPickNumber);

  return (
    <div className="flex h-full min-h-0 gap-3">
      <DraftPoolPlayerRail
        user={player1}
        fallbackName={t("player1")}
        picks={player1Picks}
        totalCost={player1TotalCost}
        accent="blue"
        activeCardId={highlightedCardId}
        activePickNumber={focusedPickNumber}
        onPickClick={scrollThenInspect}
      />

      <div className="relative min-h-52 min-w-0 flex-1 overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50">
        <div className="h-full overflow-y-auto p-3">
          {sortedPoolCards.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              {t("draftPoolEmpty")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {sortedPoolCards.map((card) => (
                <DraftPoolCard
                  key={card.id}
                  card={card}
                  picks={picksByCardId.get(card.id) ?? []}
                  player1Id={player1Id}
                  isHighlighted={highlightedCardId === card.id}
                  onClick={() => inspectImmediately(card.id)}
                />
              ))}
            </div>
          )}
        </div>

        {inspectedCard ? (
          <DraftPoolInspector
            card={inspectedCard}
            picks={inspectorPicks}
            player1Id={player1Id}
            player1={player1}
            player2={player2}
            onClose={closeInspector}
          />
        ) : null}
      </div>

      <DraftPoolPlayerRail
        user={player2}
        fallbackName={t("player2")}
        picks={player2Picks}
        totalCost={player2TotalCost}
        accent="green"
        activeCardId={highlightedCardId}
        activePickNumber={focusedPickNumber}
        onPickClick={scrollThenInspect}
      />
    </div>
  );
}
