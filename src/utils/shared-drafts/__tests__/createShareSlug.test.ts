import { describe, expect, it } from "vitest";
import { createShareSlug, createShareSlugSuffix } from "../createShareSlug";
import {
  SHARE_SLUG_FALLBACK,
  SHARE_SLUG_MAX_LENGTH,
  SHARE_SLUG_PATTERN,
  SHARE_SLUG_SUFFIX_LENGTH,
} from "../constants";

const SUFFIX = "3f9a1c2e";

describe("createShareSlug", () => {
  it("lowercases the title and joins words with dashes", () => {
    expect(createShareSlug("  Final Round: Zeus vs Hades! ", SUFFIX)).toBe(
      `final-round-zeus-vs-hades-${SUFFIX}`,
    );
  });

  it("strips accents", () => {
    expect(createShareSlug("Pégase et Méduse", SUFFIX)).toBe(`pegase-et-meduse-${SUFFIX}`);
  });

  it("falls back when the title has no latin characters", () => {
    expect(createShareSlug("Драфт от 22.11.2026", SUFFIX)).toBe(`22-11-2026-${SUFFIX}`);
    expect(createShareSlug("Драфт", SUFFIX)).toBe(`${SHARE_SLUG_FALLBACK}-${SUFFIX}`);
  });

  it("keeps long titles within the slug limit", () => {
    const slug = createShareSlug("word ".repeat(40), SUFFIX);

    expect(slug.length).toBeLessThanOrEqual(SHARE_SLUG_MAX_LENGTH);
    expect(slug).toMatch(SHARE_SLUG_PATTERN);
  });
});

describe("createShareSlugSuffix", () => {
  it("returns a lowercase hex suffix", () => {
    const suffix = createShareSlugSuffix();

    expect(suffix).toHaveLength(SHARE_SLUG_SUFFIX_LENGTH);
    expect(suffix).toMatch(/^[0-9a-f]+$/);
  });
});
