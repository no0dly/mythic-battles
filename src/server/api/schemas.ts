import { z } from "zod";

/**
 * UUID validation schema
 * Replaces deprecated z.string().uuid() with refine-based validation
 */
export const zUuid = z.string().refine(
  (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
  { message: "Invalid UUID format" }
);

