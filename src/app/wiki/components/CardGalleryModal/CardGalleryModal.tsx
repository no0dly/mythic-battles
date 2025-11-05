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
import { useState } from "react";

export default function CardGalleryModal({
  selected,
  onCloseAction,
}: {
  selected: CardType | null;
  onCloseAction: () => void;
}) {
  const [isOpen, setIsOpen] = useState(!!selected);

  const onOpenChangeHandler = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      setTimeout(() => {
        onCloseAction();
      }, 400);
    }
  };

  if (!selected) return null;

  const {
    unit_name: name,
    unit_type: unitType,
    cost,
    image_url: imageUrl,
    class: cardClass,
    talents,
    strategic_value: strategicValue,
    amount_of_card_activations: activations,
  } = selected;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeHandler}>
      <DialogContent data-testid="card-modal">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md border bg-muted mt-2">
          <Image
            src={imageUrl}
            alt={name}
            fill
            loading="lazy"
            className="object-contain p-4"
            sizes="100vw"
          />
        </div>
        <DialogDescription className="mt-3">
          <div className="space-y-2">
            <p><strong>Type:</strong> {unitType}</p>
            <p><strong>Class:</strong> {cardClass}</p>
            <p><strong>Cost:</strong> {cost}</p>
            <p><strong>Strategic Value:</strong> {strategicValue}</p>
            <p><strong>Activations:</strong> {activations}</p>
            {talents && talents.length > 0 && (
              <div>
                <strong>Talents:</strong>
                <ul className="list-disc list-inside">
                  {talents.map((talent, index) => (
                    <li key={index}>{talent}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
