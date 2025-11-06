import { CARD_TYPES } from "@/types/constants";

export const BADGE_COLORS = {
  [CARD_TYPES.HERO]: '#6a7282',
  [CARD_TYPES.MONSTER]: '#2b884f',
  [CARD_TYPES.GOD]: '#edb200',
  [CARD_TYPES.TITAN]: '#0ac5b2',
  [CARD_TYPES.TROOP]: '#f1a10d',
  [CARD_TYPES.JARL]: '#fe6e00',
  [CARD_TYPES.ART_OF_WAR]: '#fb2c36',
} as const;
