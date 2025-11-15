"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import type { Card as CardType } from "@/types/database.types";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface CardGalleryModalProps {
  isShown: boolean;
  card: CardType;
  onCloseModal: () => void;
}

export default function CardGalleryModal({
  isShown,
  card,
  onCloseModal,
}: CardGalleryModalProps) {
  const { t } = useTranslation();
  const {
    unit_name: name,
    unit_type: unitType,
    cost,
    image_url: imageUrl,
    class: cardClass,
    talents,
    strategic_value: strategicValue,
    amount_of_card_activations: activations,
  } = card;

  return (
    <Dialog open={isShown} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-3xl!" data-testid="card-modal">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="relative overflow-hidden rounded-md border bg-muted mt-2">
          <Image
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="object-contain p-4"
            width={900}
            height={900}
          />
        </div>
        <DialogDescription className="mt-3">
          <span className="space-y-2">
            <span className="flex gap-1">
              <strong>{t("type")}:</strong>
              <Badge variant={unitType}>{unitType}</Badge>
            </span>
            <span className="block">
              <strong>{t("class")}:</strong> {cardClass}
            </span>
            <span className="block">
              <strong>{t("cost")}:</strong> {cost}
            </span>
            <span className="block">
              <strong>{t("strategicValue")}:</strong> {strategicValue}
            </span>
            <span className="block">
              <strong>{t("activations")}:</strong> {activations}
            </span>
            {talents && talents.length > 0 && (
              <div>
                <strong>{t("talents")}:</strong>
                <ul className="list-disc list-inside">
                  {talents.map((talent, index) => (
                    <li key={index}>{talent}</li>
                  ))}
                </ul>
              </div>
            )}
          </span>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
