import { z } from "zod";
import { TEAM } from "@/types/constants";
import { SEAT_LABELS } from "@/utils/drafts/turnOrder";
import {
  SHARE_SLUG_MAX_LENGTH,
  SHARE_SLUG_MIN_LENGTH,
  SHARE_SLUG_PATTERN,
  SHARE_TITLE_MAX_LENGTH,
} from "./constants";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const zShareSlug = z
  .string()
  .min(SHARE_SLUG_MIN_LENGTH)
  .max(SHARE_SLUG_MAX_LENGTH)
  .regex(SHARE_SLUG_PATTERN);

export const zCardIds = z.array(
  z.string().refine((value) => UUID_PATTERN.test(value)),
);

export const zSharedDraftHistory = z.object({
  picks: z.array(
    z.object({
      card_id: z.string().refine((value) => UUID_PATTERN.test(value)),
      player_id: z.enum(SEAT_LABELS),
      pick_number: z.number().int(),
      timestamp: z.string(),
      auto: z.boolean().optional(),
      cost_override: z.number().optional(),
    }),
  ),
});

export const zShareTitle = z.string().trim().min(1).max(SHARE_TITLE_MAX_LENGTH);

export const zSharedDraftArmies = z.array(
  z.object({
    team: z.union([z.literal(TEAM.FIRST), z.literal(TEAM.SECOND)]).nullish(),
    card_ids: zCardIds,
  }),
);
