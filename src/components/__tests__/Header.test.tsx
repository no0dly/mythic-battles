import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

// Mock the next/navigation module
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
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

vi.mock("@/components/NotificationsBell", () => ({
  NotificationsBell: () => <div data-testid="notifications-bell" />,
}));

// Mock the Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Header Component", () => {
  it("renders AuthStatus with correct user email", async () => {
    const mockEmail = "user@example.com";

    // Mock the createClient to return a user with email
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { email: mockEmail } },
        }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const component = await Header();
    render(component);

    // Check if the user email is rendered in the AuthStatus component
    const emailLink = screen.getByRole("link", { name: mockEmail });
    expect(emailLink).toBeTruthy();
    expect(emailLink.getAttribute("href")).toBe("/profile");
  });

  it("renders AuthStatus with null when user is not authenticated", async () => {
    // Mock the createClient to return no user
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const component = await Header();
    render(component);

    // Check if the login link is rendered when user is null
    const loginLink = screen.getByRole("link", { name: "login" });
    expect(loginLink).toBeTruthy();
    expect(loginLink.getAttribute("href")).toBe("/auth/login");
  });
});
