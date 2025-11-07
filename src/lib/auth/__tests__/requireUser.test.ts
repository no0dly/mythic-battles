import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { requireUser } from "../requireUser";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const redirectMock = redirect as unknown as ReturnType<typeof vi.fn>;
const createClientMock = createClient as unknown as ReturnType<typeof vi.fn>;
const getUserMock = vi.fn();

describe("requireUser", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    getUserMock.mockReset();
    createClientMock.mockReset();
    createClientMock.mockResolvedValue({
      auth: {
        getUser: getUserMock,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated user when present", async () => {
    const mockUser = { id: "user-id" };
    getUserMock.mockResolvedValue({
      data: { user: mockUser },
    });

    const result = await requireUser();

    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockUser);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to the login page when user is missing", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
    });
    redirectMock.mockImplementation(() => {
      throw new Error("redirect");
    });

    await expect(requireUser()).rejects.toThrowError("redirect");

    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
  });
});

