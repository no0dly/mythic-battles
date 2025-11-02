import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import FriendsListForm from "../FriendsListForm";

// Mock react-i18next
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    friendEmail: "Friend's Email",
    addFriend: "Add Friend",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
  };
  return translations[key] || key;
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe("FriendsListForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form with input and submit button", () => {
    const { container } = render(<FriendsListForm isOpen={true} />);

    const input = container.querySelector('input[name="email"]');
    const button = screen.getAllByRole("button", { name: "Add Friend" })[0];

    expect(input).toBeTruthy();
    expect(button).toBeTruthy();
  });

  it("validates empty email submission", async () => {
    const { container } = render(<FriendsListForm isOpen={true} />);

    const submitButton = screen.getAllByRole("button", { name: "Add Friend" })[0];
    fireEvent.click(submitButton);

    // Email validation runs first, so empty string triggers email format error
    await waitFor(() => {
      const errorMessage = screen.getByText("Please enter a valid email address");
      expect(errorMessage).toBeTruthy();
    });
  });

  it("validates invalid email format", async () => {
    const { container } = render(<FriendsListForm isOpen={true} />);

    const input = container.querySelector('input[name="email"]') as HTMLInputElement;
    const submitButton = screen.getAllByRole("button", { name: "Add Friend" })[0];

    fireEvent.change(input, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeTruthy();
    });
  });

  it("submits valid email and resets form", async () => {
    const { container } = render(<FriendsListForm isOpen={true} />);

    const input = container.querySelector('input[name="email"]') as HTMLInputElement;
    const submitButton = screen.getAllByRole("button", { name: "Add Friend" })[0];

    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("resets form when isOpen becomes false", async () => {
    const { container, rerender } = render(<FriendsListForm isOpen={true} />);

    const input = container.querySelector('input[name="email"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(input.value).toBe("test@example.com");

    rerender(<FriendsListForm isOpen={false} />);

    await waitFor(() => {
      const newInput = container.querySelector('input[name="email"]') as HTMLInputElement;
      expect(newInput.value).toBe("");
    });
  });

  it("clears errors when isOpen becomes false", async () => {
    const { rerender } = render(<FriendsListForm isOpen={true} />);

    const submitButton = screen.getAllByRole("button", { name: "Add Friend" })[0];
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByText("Please enter a valid email address");
      expect(errorMessage).toBeTruthy();
    });

    rerender(<FriendsListForm isOpen={false} />);
    rerender(<FriendsListForm isOpen={true} />);

    await waitFor(() => {
      expect(screen.queryByText("Please enter a valid email address")).toBeNull();
    });
  });

  it("allows form submission via Enter key", async () => {
    const { container } = render(<FriendsListForm isOpen={true} />);

    const input = container.querySelector('input[name="email"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@example.com" } });
    
    const form = input.closest("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });
  });
});