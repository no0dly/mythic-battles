import { CARD_TYPES } from "@/types/constants";

export const BADGE_COLORS = {
  [CARD_TYPES.HERO]: '#475569',
  [CARD_TYPES.MONSTER]: '#059669',
  [CARD_TYPES.GOD]: '#f59e0b',
  [CARD_TYPES.TITAN]: '#06b6d4',
  [CARD_TYPES.TROOP]: '#ea580c',
  [CARD_TYPES.JARL]: '#9333ea',
  [CARD_TYPES.ART_OF_WAR]: '#dc2626',
  [CARD_TYPES.TROOP_ATTACHMENT]: '#4f46e5',
} as const;
