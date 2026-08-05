/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import FriendsListForm from "../FriendsListForm";

const mockMutate = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("@/trpc/client", () => ({
  api: {
    useUtils: () => ({
      friendships: {
        getSentRequests: {
          invalidate: mockInvalidate,
        },
      },
    }),
    friendships: {
      sendRequest: {
        useMutation: (opts?: any) => ({
          mutate: (data: any) => {
            mockMutate(data);
            opts?.onSuccess?.();
          },
          isPending: false,
          isSuccess: false,
          isError: false,
          error: null,
        }),
      },
    },
  },
}));

vi.mock("@/components/UserCombobox", () => ({
  default: ({
    onValueChange,
  }: {
    onValueChange: (user: { id: string; displayName: string } | null) => void;
  }) => (
    <button
      type="button"
      onClick={() => onValueChange({ id: "user-1", displayName: "Alice" })}
    >
      Mock Combobox
    </button>
  ),
}));

const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    friendInviteByName: "By name",
    friendInviteByEmail: "By email",
    friendName: "Friend's name",
    friendNamePlaceholder: "enter name",
    friendEmail: "Friend's email",
    friendEmailPlaceholder: "Enter email address",
    addFriend: "Send Request",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
    friendRequestSent: "Friend request sent",
    errorSendingRequest: "Error sending request",
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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FriendsListForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders name and email tabs", () => {
    render(<FriendsListForm />);

    expect(screen.getByRole("tab", { name: "By name" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "By email" })).toBeTruthy();
  });

  it("disables send until a user is selected", () => {
    render(<FriendsListForm />);

    const submitButton = screen.getByRole("button", {
      name: "Send Request",
    });
    expect(submitButton.hasAttribute("disabled")).toBe(true);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("sends friend request by selected user id", async () => {
    render(<FriendsListForm />);

    fireEvent.click(screen.getByRole("button", { name: "Mock Combobox" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send Request",
      })
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ friendId: "user-1" });
    });
  });

  it("shows name search by default", () => {
    render(<FriendsListForm />);

    expect(screen.getByText("Friend's name")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mock Combobox" })).toBeTruthy();
  });

  it("switches to email tab content", () => {
    render(<FriendsListForm />);

    fireEvent.click(screen.getByRole("tab", { name: "By email" }));

    expect(screen.getByText("Friend's email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter email address")).toBeTruthy();
  });

  it("shows email required for empty submission", async () => {
    render(<FriendsListForm />);

    fireEvent.click(screen.getByRole("tab", { name: "By email" }));
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows invalid email for malformed address", async () => {
    render(<FriendsListForm />);

    fireEvent.click(screen.getByRole("tab", { name: "By email" }));
    fireEvent.change(screen.getByPlaceholderText("Enter email address"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address")
      ).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
