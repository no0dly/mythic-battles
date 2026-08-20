import { z } from "zod";
import {
  SHARE_SLUG_MAX_LENGTH,
  SHARE_SLUG_MIN_LENGTH,
  SHARE_SLUG_PATTERN,
} from "@/utils/shared-drafts/constants";

/**
 * UUID validation schema
 * Replaces deprecated z.string().uuid() with refine-based validation
 */
export const zUuid = z.string().refine(
  (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
  { message: "Invalid UUID format" }
);

export const zShareSlug = z
  .string()
  .min(SHARE_SLUG_MIN_LENGTH)
  .max(SHARE_SLUG_MAX_LENGTH)
  .regex(SHARE_SLUG_PATTERN);



