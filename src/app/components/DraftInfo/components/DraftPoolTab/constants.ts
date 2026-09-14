export const INSPECT_SCROLL_DELAY_MS = 450;

export const PLAYER_ACCENTS = {
  blue: {
    rail: "border-blue-200 bg-blue-50/90",
    title: "text-blue-900",
    badge: "bg-blue-600 text-white",
    ring: "border-blue-500",
    highlight: "ring-blue-500",
    row: "hover:bg-blue-100/80",
    rowActive: "bg-blue-100",
    meta: "border-blue-200 bg-blue-50 text-blue-900",
  },
  green: {
    rail: "border-green-200 bg-green-50/90",
    title: "text-green-900",
    badge: "bg-green-600 text-white",
    ring: "border-green-500",
    highlight: "ring-green-500",
    row: "hover:bg-green-100/80",
    rowActive: "bg-green-100",
    meta: "border-green-200 bg-green-50 text-green-900",
  },
} as const;

export type PlayerAccent = keyof typeof PLAYER_ACCENTS;

export const playerAccentStyles = (isPlayer1: boolean) =>
  isPlayer1 ? PLAYER_ACCENTS.blue : PLAYER_ACCENTS.green;

export const draftPoolCardElementId = (cardId: string) =>
  `draft-pool-card-${cardId}`;
