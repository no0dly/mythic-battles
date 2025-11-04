import { describe, it, expect } from "vitest";
import {
  calculateWinRate,
  formatDisplayName,
  getUserInitials,
  hasAvatar,
  formatStatistics,
  updateStatsAfterGame,
  validateProfileUpdate,
  isActiveUser,
  getUserRank,
  compareUsersByRank,
  filterUsersByQuery,
} from "../helpers";
import type { UserProfile } from "@/types/database.types";

describe("calculateWinRate", () => {
  it("should calculate win rate correctly", () => {
    expect(calculateWinRate(45, 60)).toBe(75.0);
    expect(calculateWinRate(10, 10)).toBe(100.0);
    expect(calculateWinRate(0, 10)).toBe(0.0);
    expect(calculateWinRate(33, 100)).toBe(33.0);
  });

  it("should return 0 for zero total games", () => {
    expect(calculateWinRate(0, 0)).toBe(0);
  });

  it("should round to 2 decimal places", () => {
    expect(calculateWinRate(1, 3)).toBe(33.33);
    expect(calculateWinRate(2, 3)).toBe(66.67);
  });
});

describe("formatDisplayName", () => {
  it("should return display name if it exists", () => {
    expect(formatDisplayName("John Doe", "john@example.com")).toBe("John Doe");
  });

  it("should return email username if display name is empty", () => {
    expect(formatDisplayName("", "john@example.com")).toBe("john");
  });

  it("should handle whitespace-only display names", () => {
    expect(formatDisplayName("   ", "john@example.com")).toBe("john");
  });
});

describe("getUserInitials", () => {
  it("should return initials from two-word display name", () => {
    expect(getUserInitials("John Doe", "john@example.com")).toBe("JD");
  });

  it("should return first two characters for single-word name", () => {
    expect(getUserInitials("John", "john@example.com")).toBe("JO");
  });

  it("should use email if display name is empty", () => {
    expect(getUserInitials("", "john@example.com")).toBe("JO");
  });
});

describe("hasAvatar", () => {
  it("should return true for valid avatar URL", () => {
    expect(hasAvatar("https://example.com/avatar.jpg")).toBe(true);
  });

  it("should return false for empty string", () => {
    expect(hasAvatar("")).toBe(false);
  });

  it("should return false for null", () => {
    expect(hasAvatar(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(hasAvatar(undefined)).toBe(false);
  });

  it("should return false for whitespace-only string", () => {
    expect(hasAvatar("   ")).toBe(false);
  });
});

describe("formatStatistics", () => {
  it("should format statistics correctly", () => {
    const stats = {
      wins: 10,
      losses: 5,
      total_games: 15,
      win_rate: 66.67,
      longest_win_streak: 3,
      longest_loss_streak: 2,
    };

    const formatted = formatStatistics(stats);

    expect(formatted).toEqual({
      wins: 10,
      losses: 5,
      totalGames: 15,
      winRate: "66.67%",
      longestWinStreak: 3,
      longestLossStreak: 2,
    });
  });
});

describe("updateStatsAfterGame", () => {
  it("should update stats after a win", () => {
    const currentStats = {
      wins: 10,
      losses: 5,
      total_games: 15,
      win_rate: 66.67,
      longest_win_streak: 3,
      longest_loss_streak: 2,
    };

    const updated = updateStatsAfterGame(currentStats, true);

    expect(updated.wins).toBe(11);
    expect(updated.losses).toBe(5);
    expect(updated.total_games).toBe(16);
    expect(updated.win_rate).toBe(68.75);
    expect(updated.longest_win_streak).toBe(11);
  });

  it("should update stats after a loss", () => {
    const currentStats = {
      wins: 10,
      losses: 5,
      total_games: 15,
      win_rate: 66.67,
      longest_win_streak: 3,
      longest_loss_streak: 2,
    };

    const updated = updateStatsAfterGame(currentStats, false);

    expect(updated.wins).toBe(10);
    expect(updated.losses).toBe(6);
    expect(updated.total_games).toBe(16);
    expect(updated.win_rate).toBe(62.5);
    expect(updated.longest_loss_streak).toBe(6);
  });
});

describe("validateProfileUpdate", () => {
  it("should validate correct profile data", () => {
    const result = validateProfileUpdate({
      display_name: "John Doe",
      avatar_url: "https://example.com/avatar.jpg",
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject empty display name", () => {
    const result = validateProfileUpdate({
      display_name: "",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Display name cannot be empty");
  });

  it("should reject display name that is too long", () => {
    const result = validateProfileUpdate({
      display_name: "A".repeat(51),
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Display name must be less than 50 characters");
  });

  it("should reject invalid avatar URL", () => {
    const result = validateProfileUpdate({
      avatar_url: "not-a-url",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Avatar URL must be a valid URL");
  });

  it("should accept empty avatar URL", () => {
    const result = validateProfileUpdate({
      avatar_url: "",
    });

    expect(result.isValid).toBe(true);
  });
});

describe("isActiveUser", () => {
  it("should return true for recently updated user with games", () => {
    const user: UserProfile = {
      id: "1",
      email: "test@example.com",
      display_name: "Test",
      avatar_url: "",
      statistics: {
        wins: 5,
        losses: 3,
        total_games: 8,
        win_rate: 62.5,
        longest_win_streak: 2,
        longest_loss_streak: 1,
      },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString(),
    };

    expect(isActiveUser(user, 30)).toBe(true);
  });

  it("should return false for user with no games", () => {
    const user: UserProfile = {
      id: "1",
      email: "test@example.com",
      display_name: "Test",
      avatar_url: "",
      statistics: {
        wins: 0,
        losses: 0,
        total_games: 0,
        win_rate: 0,
        longest_win_streak: 0,
        longest_loss_streak: 0,
      },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString(),
    };

    expect(isActiveUser(user, 30)).toBe(false);
  });
});

describe("getUserRank", () => {
  it("should return 'beginner' for users with less than 5 games", () => {
    const stats = {
      wins: 2,
      losses: 1,
      total_games: 3,
      win_rate: 66.67,
      longest_win_streak: 2,
      longest_loss_streak: 1,
    };

    expect(getUserRank(stats)).toBe("beginner");
  });

  it("should return 'legend' for high win rate and many games", () => {
    const stats = {
      wins: 80,
      losses: 20,
      total_games: 100,
      win_rate: 80.0,
      longest_win_streak: 10,
      longest_loss_streak: 2,
    };

    expect(getUserRank(stats)).toBe("legend");
  });
});

describe("compareUsersByRank", () => {
  it("should sort by win rate", () => {
    const user1: UserProfile = {
      id: "1",
      email: "user1@example.com",
      display_name: "User 1",
      avatar_url: "",
      statistics: {
        wins: 70,
        losses: 30,
        total_games: 100,
        win_rate: 70.0,
        longest_win_streak: 5,
        longest_loss_streak: 3,
      },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    const user2: UserProfile = {
      ...user1,
      id: "2",
      statistics: {
        ...user1.statistics,
        wins: 80,
        win_rate: 80.0,
      },
    };

    expect(compareUsersByRank(user1, user2)).toBeGreaterThan(0);
    expect(compareUsersByRank(user2, user1)).toBeLessThan(0);
  });
});

describe("filterUsersByQuery", () => {
  const users: UserProfile[] = [
    {
      id: "1",
      email: "john@example.com",
      display_name: "John Doe",
      avatar_url: "",
      statistics: {
        wins: 0,
        losses: 0,
        total_games: 0,
        win_rate: 0,
        longest_win_streak: 0,
        longest_loss_streak: 0,
      },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      email: "jane@example.com",
      display_name: "Jane Smith",
      avatar_url: "",
      statistics: {
        wins: 0,
        losses: 0,
        total_games: 0,
        win_rate: 0,
        longest_win_streak: 0,
        longest_loss_streak: 0,
      },
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ];

  it("should filter by email", () => {
    const result = filterUsersByQuery(users, "john");
    expect(result).toHaveLength(1);
    expect(result[0]?.email).toBe("john@example.com");
  });

  it("should filter by display name", () => {
    const result = filterUsersByQuery(users, "jane");
    expect(result).toHaveLength(1);
    expect(result[0]?.display_name).toBe("Jane Smith");
  });

  it("should be case insensitive", () => {
    const result = filterUsersByQuery(users, "JOHN");
    expect(result).toHaveLength(1);
  });

  it("should return empty array for no matches", () => {
    const result = filterUsersByQuery(users, "xyz");
    expect(result).toHaveLength(0);
  });
});

