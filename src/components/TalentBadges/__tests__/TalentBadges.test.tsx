import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TalentBadges } from "../TalentBadges";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("TalentBadges", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    window.matchMedia = originalMatchMedia;
  });

  it("renders nothing when there are no talents", () => {
    const { container } = render(<TalentBadges talents={[]} />);
    expect(container.textContent).toBe("");
  });

  it("shows the talent effect after tapping a badge", async () => {
    render(<TalentBadges talents={["block"]} />);

    fireEvent.click(screen.getByText("talentTitles.block"));

    expect(await screen.findByText("talentEffects.block")).toBeTruthy();
  });
});
