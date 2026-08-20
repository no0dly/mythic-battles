import { CARD_CLASS, CARD_ORIGIN, CARD_TYPES } from "@/types/constants";
import type { Card } from "@/types/database.types";
import { ZEUS_ID } from "./constants";

export const makeCard = (overrides: Partial<Card> = {}): Card => ({
  id: ZEUS_ID,
  unit_name: "Zeus",
  unit_type: CARD_TYPES.GOD,
  cost: 6,
  amount_of_card_activations: 1,
  strategic_value: 1,
  talents: [],
  class: [CARD_CLASS.TERRESTRIAL],
  origin: CARD_ORIGIN.COR,
  extra: null,
  image_url: "/zeus.jpg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});
