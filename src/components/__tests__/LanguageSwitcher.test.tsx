import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import LanguageSwitcher from "../LanguageSwitcher";

// Mock react-i18next
const mockChangeLanguage = vi.fn();
const mockUseTranslation = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe("LanguageSwitcher Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: {
        resolvedLanguage: "en",
        changeLanguage: mockChangeLanguage,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders language switcher button with icon", () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole("button", { name: "Change language" });
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-label")).toBe("Change language");
    expect(button.getAttribute("aria-haspopup")).toBe("menu");
  });

  it("renders button with closed state initially", () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole("button", { name: "Change language" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("uses current language from i18n", () => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: {
        resolvedLanguage: "ru",
        changeLanguage: mockChangeLanguage,
      },
    });

    render(<LanguageSwitcher />);

    const button = screen.getByRole("button", { name: "Change language" });
    expect(button).toBeTruthy();
  });

  it("uses default language 'en' when resolvedLanguage is undefined", () => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: {
        resolvedLanguage: undefined,
        changeLanguage: mockChangeLanguage,
      },
    });

    render(<LanguageSwitcher />);

    const button = screen.getByRole("button", { name: "Change language" });
    expect(button).toBeTruthy();
  });

  it("renders with different language states", () => {
    // Test with English
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: {
        resolvedLanguage: "en",
        changeLanguage: mockChangeLanguage,
      },
    });

    const { rerender } = render(<LanguageSwitcher />);
    let button = screen.getByRole("button", { name: "Change language" });
    expect(button).toBeTruthy();

    // Test with Russian
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: {
        resolvedLanguage: "ru",
        changeLanguage: mockChangeLanguage,
      },
    });

    rerender(<LanguageSwitcher />);
    button = screen.getByRole("button", { name: "Change language" });
    expect(button).toBeTruthy();
  });
});
