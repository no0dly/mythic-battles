import {
  SHARE_SLUG_FALLBACK,
  SHARE_SLUG_MAX_LENGTH,
  SHARE_SLUG_SUFFIX_LENGTH,
} from "./constants";

const DIACRITICS_PATTERN = /[\u0300-\u036f]/g;
const NON_SLUG_CHARS_PATTERN = /[^a-z0-9]+/g;
const EDGE_DASHES_PATTERN = /^-+|-+$/g;

/** Turns a title into a URL slug with a random suffix, e.g. "Final round" -> "final-round-3f9a1c2e". */
export const createShareSlug = (title: string, suffix: string): string => {
  const maxBaseLength = SHARE_SLUG_MAX_LENGTH - SHARE_SLUG_SUFFIX_LENGTH - 1;
  const base =
    title
      .normalize("NFKD")
      .replace(DIACRITICS_PATTERN, "")
      .toLowerCase()
      .replace(NON_SLUG_CHARS_PATTERN, "-")
      .replace(EDGE_DASHES_PATTERN, "")
      .slice(0, maxBaseLength)
      .replace(EDGE_DASHES_PATTERN, "") || SHARE_SLUG_FALLBACK;

  return `${base}-${suffix.toLowerCase().slice(0, SHARE_SLUG_SUFFIX_LENGTH)}`;
};

export const createShareSlugSuffix = (): string =>
  crypto.randomUUID().replace(/-/g, "").slice(0, SHARE_SLUG_SUFFIX_LENGTH);
