"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
// update this when you connect with be
import type { CardItem } from "../CardGalleryItem";
import { useState } from "react";

export default function CardGalleryModal({
  selected,
  onCloseAction,
}: {
  selected: CardItem | null;
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeHandler}>
      <DialogContent data-testid="card-modal">
        <DialogHeader>
          <DialogTitle>{selected?.title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md border bg-muted mt-2">
          <Image
            src={selected?.imageUrl ?? ""}
            alt={selected?.title ?? ""}
            fill
            className="object-contain p-4"
            sizes="100vw"
          />
        </div>
        <DialogDescription className="mt-3">
          {selected?.longDescription}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
