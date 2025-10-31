import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PageLayout from "../PageLayout";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        wiki: "Wiki",
        "some.key": "Some Key",
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe("PageLayout Component", () => {
  it("renders title correctly", () => {
    render(
      <PageLayout title="wiki">
        <div>Test content</div>
      </PageLayout>
    );

    const heading = screen.getByRole("heading", { name: "Wiki" });
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe("H2");
  });

  it("renders children correctly", () => {
    render(
      <PageLayout title="wiki">
        <div>Test content</div>
        <p>Another element</p>
      </PageLayout>
    );

    expect(screen.queryAllByText("Test content")).toBeTruthy();
    expect(screen.queryAllByText("Another element")).toBeTruthy();
  });

  it("translates title key correctly", () => {
    render(
      <PageLayout title="hello">
        <div>Content</div>
      </PageLayout>
    );

    const heading = screen.getByRole("heading", { name: "hello" });
    expect(heading).toBeTruthy();
  });
});
