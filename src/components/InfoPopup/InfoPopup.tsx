"use client";

import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  INFO_POPUP_COLLISION_PADDING,
  INFO_POPUP_CONTENT_CLASS,
  INFO_POPUP_CONTENT_DATASET,
  INFO_POPUP_CONTENT_SELECTOR,
  INFO_POPUP_SIDE_OFFSET,
  INFO_POPUP_SURFACE_CLASS,
  INFO_POPUP_TRIGGER_WRAP_CLASS,
} from "./constants";
import { useDismissOnOutsidePress, usePrefersFinePointer } from "./hooks";
import type { InfoPopupProps } from "./types";

function preventDefault(event: Event) {
  event.preventDefault();
}

export function InfoPopup({ content, children }: InfoPopupProps) {
  const prefersFinePointer = usePrefersFinePointer();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useDismissOnOutsidePress(!prefersFinePointer && open, () => setOpen(false), (target) => {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      triggerRef.current?.contains(target) || target.closest(INFO_POPUP_CONTENT_SELECTOR),
    );
  });

  if (prefersFinePointer) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          sideOffset={INFO_POPUP_SIDE_OFFSET}
          className={INFO_POPUP_CONTENT_CLASS}
          {...INFO_POPUP_CONTENT_DATASET}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span ref={triggerRef} className={INFO_POPUP_TRIGGER_WRAP_CLASS}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          sideOffset={INFO_POPUP_SIDE_OFFSET}
          collisionPadding={INFO_POPUP_COLLISION_PADDING}
          className={cn(INFO_POPUP_SURFACE_CLASS, INFO_POPUP_CONTENT_CLASS)}
          {...INFO_POPUP_CONTENT_DATASET}
          onOpenAutoFocus={preventDefault}
          onCloseAutoFocus={preventDefault}
        >
          {content}
        </PopoverContent>
      </Popover>
    </span>
  );
}
