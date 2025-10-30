import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthStatus } from "../AuthStatus";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe("AuthStatus Component", () => {
  it("renders login link when user is null", () => {
    render(<AuthStatus userEmail={null} />);

    const loginLink = screen.getByRole("link", { name: "login" });
    expect(loginLink).toBeTruthy();
    expect(loginLink.getAttribute("href")).toBe("/auth/login");
  });

  it("renders user email link when user is present", () => {
    const testEmail = "test@example.com";
    render(<AuthStatus userEmail={testEmail} />);

    const emailLink = screen.getByRole("link", { name: testEmail });
    expect(emailLink).toBeTruthy();
    expect(emailLink.getAttribute("href")).toBe("/profile");
  });

  it("renders different user emails correctly", () => {
    const email1 = "john.doe@example.com";
    const { rerender } = render(<AuthStatus userEmail={email1} />);

    let emailLink = screen.getByRole("link", { name: email1 });
    expect(emailLink).toBeTruthy();

    const email2 = "jane.smith@example.com";
    rerender(<AuthStatus userEmail={email2} />);

    emailLink = screen.getByRole("link", { name: email2 });
    expect(emailLink).toBeTruthy();
  });
});
