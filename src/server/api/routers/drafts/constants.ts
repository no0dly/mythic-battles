import { DEFAULT_DRAFT_SETTINGS } from "@/types/constants";
import { DraftPoolConfig } from "@/types/draft-settings.types";


/**
 * Special case unit names that have variant versions
 * When one version is selected, the other should be excluded
 */
export const SPECIAL_CASE_UNITS = {
  /** Titan/Monster pairs - selecting titan excludes monster */
  TITAN_MONSTER_PAIRS: ["Fenrir", "Ammit", "Kraken"] as const,

  /** Hero variants - selecting one excludes others */
  HERO_VARIANTS: ["Achilles", "Heracles", "Lagertha"] as const,
} as const;

/**
 * Maximum iterations to prevent infinite loops in draft generation
 */
export const MAX_DRAFT_ITERATIONS = 10000;

/**
 * Default draft pool configuration (snake_case, matches database format)
 */
export const DEFAULT_DRAFT_CONFIG: DraftPoolConfig = {
  draft_size: DEFAULT_DRAFT_SETTINGS.draft_size,
  gods_amount: DEFAULT_DRAFT_SETTINGS.gods_amount,
  titans_amount: DEFAULT_DRAFT_SETTINGS.titans_amount,
};

