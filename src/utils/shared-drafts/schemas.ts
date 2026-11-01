import { z } from "zod";
import { TEAM } from "@/types/constants";
import {
  SHARE_SLUG_MAX_LENGTH,
  SHARE_SLUG_MIN_LENGTH,
  SHARE_SLUG_PATTERN,
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

export const zSharedDraftArmies = z.array(
  z.object({
    team: z.union([z.literal(TEAM.FIRST), z.literal(TEAM.SECOND)]).nullish(),
    card_ids: zCardIds,
  }),
);
