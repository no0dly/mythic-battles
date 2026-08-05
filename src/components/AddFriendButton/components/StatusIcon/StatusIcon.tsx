"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ACTION_SLOT_CLASS } from "../../constants";

interface StatusIconProps {
  label: string;
  className?: string;
  children: ReactNode;
}

export default function StatusIcon({
  label,
  className,
  children,
}: StatusIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          aria-label={label}
          className={cn(ACTION_SLOT_CLASS, "rounded-full border", className)}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
