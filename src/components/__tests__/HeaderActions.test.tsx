import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HeaderActions from "../HeaderActions/HeaderActions";

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe("HeaderActions Component", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("does not render wiki link when on wiki page", () => {
    mockUsePathname.mockReturnValue("/wiki");

    render(
      <HeaderActions>
        <div>Test children</div>
      </HeaderActions>
    );

    const wikiLink = screen.queryByRole("link", { name: "wiki" });
    expect(wikiLink).toBeNull();
  });

  it("renders wiki link when not on wiki page", () => {
    render(
      <HeaderActions>
        <div>Test children</div>
      </HeaderActions>
    );

    const wikiLink = screen.getByRole("link", { name: "wiki" });
    expect(wikiLink).toBeTruthy();
    expect(wikiLink.getAttribute("href")).toBe("/wiki");
  });

  it("renders children correctly", () => {
    render(
      <HeaderActions>
        <button>Click me</button>
        <span>Some text</span>
      </HeaderActions>
    );

    expect(screen.getByRole("button", { name: "Click me" })).toBeTruthy();
    expect(screen.getByText("Some text")).toBeTruthy();
  });
});
