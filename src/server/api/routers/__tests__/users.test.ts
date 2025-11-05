/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usersRouter } from "../users";
import type { UserProfile } from "@/types/database.types";

const TEST_USER_UUID = "550e8400-e29b-41d4-a716-446655440000";

const mockUser: UserProfile = {
  id: TEST_USER_UUID,
  email: "test@example.com",
  display_name: "Test User",
  avatar_url: "https://example.com/avatar.jpg",
  statistics: {
    wins: 10,
    losses: 5,
    total_games: 15,
    win_rate: 66.67,
    longest_win_streak: 3,
    longest_loss_streak: 2,
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const createMockContext = (overrides = {}) => ({
  session: {
    user: {
      id: TEST_USER_UUID,
      email: "test@example.com",
    },
  },
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockUser,
            error: null,
          })),
        })),
      })),
    })),
  },
  ...overrides,
});

describe("usersRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should return current user profile", async () => {
      const ctx = createMockContext() as any;
      const caller = usersRouter.createCaller(ctx);

      const result = await caller.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(ctx.supabase.from).toHaveBeenCalledWith("users");
    });

    it("should throw error if user not found", async () => {
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: null,
                  error: { message: "Not found" },
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = usersRouter.createCaller(ctx);

      await expect(caller.getCurrentUser()).rejects.toThrow();
    });
  });

  describe("getUserById", () => {
    it("should return user by ID", async () => {
      const ctx = createMockContext() as any;
      const caller = usersRouter.createCaller(ctx);

      const result = await caller.getUserById({ userId: TEST_USER_UUID });

      expect(result).toBeDefined();
    });
  });

  describe("searchUsers", () => {
    it("should search users by query", async () => {
      const mockSearchResults = [
        {
          id: "user-1",
          email: "user1@example.com",
          display_name: "User One",
          avatar_url: "",
        },
        {
          id: "user-2",
          email: "user2@example.com",
          display_name: "User Two",
          avatar_url: "",
        },
      ];

      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              or: vi.fn(() => ({
                limit: vi.fn(() => ({
                  data: mockSearchResults,
                  error: null,
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = usersRouter.createCaller(ctx);

      const result = await caller.searchUsers({ query: "user", limit: 10 });

      expect(result).toEqual(mockSearchResults);
      expect(result).toHaveLength(2);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const updatedUser = {
        ...mockUser,
        display_name: "Updated Name",
      };

      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: updatedUser,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = usersRouter.createCaller(ctx);

      const result = await caller.updateProfile({
        display_name: "Updated Name",
      });

      expect(result.display_name).toBe("Updated Name");
    });
  });

  describe("updateStatistics", () => {
    it("should update user statistics", async () => {
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { statistics: mockUser.statistics },
                  error: null,
                })),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: mockUser,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = usersRouter.createCaller(ctx);

      const result = await caller.updateStatistics({
        wins: 15,
      });

      expect(result).toBeDefined();
    });
  });

  describe("incrementWin", () => {
    it("should increment win count and update statistics", async () => {
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { statistics: mockUser.statistics },
                  error: null,
                })),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: {
                      ...mockUser,
                      statistics: {
                        ...mockUser.statistics,
                        wins: 11,
                        total_games: 16,
                      },
                    },
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = usersRouter.createCaller(ctx);

      const result = await caller.incrementWin();

      expect(result.statistics.wins).toBeGreaterThan(mockUser.statistics.wins);
    });
  });

  describe("incrementLoss", () => {
    it("should increment loss count and update statistics", async () => {
      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { statistics: mockUser.statistics },
                  error: null,
                })),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: {
                      ...mockUser,
                      statistics: {
                        ...mockUser.statistics,
                        losses: 6,
                        total_games: 16,
                      },
                    },
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = usersRouter.createCaller(ctx);

      const result = await caller.incrementLoss();

      expect(result.statistics.losses).toBeGreaterThan(
        mockUser.statistics.losses
      );
    });
  });

  describe("getLeaderboard", () => {
    it("should return leaderboard sorted by win rate", async () => {
      const mockLeaderboard = [
        {
          id: "user-1",
          display_name: "Top Player",
          avatar_url: "",
          statistics: {
            wins: 50,
            losses: 10,
            total_games: 60,
            win_rate: 83.33,
            longest_win_streak: 10,
            longest_loss_streak: 2,
          },
        },
        {
          id: "user-2",
          display_name: "Second Player",
          avatar_url: "",
          statistics: {
            wins: 30,
            losses: 20,
            total_games: 50,
            win_rate: 60.0,
            longest_win_streak: 5,
            longest_loss_streak: 3,
          },
        },
      ];

      const ctx = createMockContext({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              gte: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    data: mockLeaderboard,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        },
      }) as any;
      const caller = usersRouter.createCaller(ctx);

      const result = await caller.getLeaderboard({ limit: 10, minGames: 5 });

      expect(result).toEqual(mockLeaderboard);
      expect(result[0]?.statistics.win_rate).toBeGreaterThan(
        result[1]?.statistics.win_rate ?? 0
      );
    });
  });

});

