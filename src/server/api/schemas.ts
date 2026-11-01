import { z } from "zod";
import { GAME_MODE_VALUES, TEAM } from "@/types/constants";

/**
 * UUID validation schema
 * Replaces deprecated z.string().uuid() with refine-based validation
 */
export const zUuid = z.string().refine(
  (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
  { message: "Invalid UUID format" }
);

export const zGameMode = z.enum(GAME_MODE_VALUES);

export const zTeam = z.union([z.literal(TEAM.FIRST), z.literal(TEAM.SECOND)]);

export const zPlayerTeams = z.record(zUuid, zTeam);

export { zShareSlug } from "@/utils/shared-drafts/schemas";
