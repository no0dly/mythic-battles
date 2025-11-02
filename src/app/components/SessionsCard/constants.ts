import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import { TranslationKey } from "@/i18n";

export type GameStatus = "available" | "draft" | "inProgress" | "finished";

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const GAME_STATUS_CONFIG: Record<GameStatus, { label: TranslationKey; variant: BadgeVariant }> = {
  available: {
    label: "available",
    variant: "available",
  },
  draft: {
    label: "draft",
    variant: "draft",
  },
  inProgress: {
    label: "inProgress",
    variant: "inProgress",
  },
  finished: {
    label: "finished",
    variant: "finished",
  },
};


