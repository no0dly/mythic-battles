/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { friendshipsRouter } from "../friendships";
import type { Session } from "@supabase/supabase-js";

// Valid UUIDs for testing
const TEST_USER_UUID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_FRIEND_UUID = "550e8400-e29b-41d4-a716-446655440001";
const TEST_FRIENDSHIP_UUID = "550e8400-e29b-41d4-a716-446655440002";

// Mock Supabase client
const createMockSupabase = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
});

// Mock context
const createMockContext = (userId: string) => ({
  session: {
    user: {
      id: userId,
      email: "test@example.com",
    },
  } as Session,
  supabase: createMockSupabase() as any,
});

describe("friendshipsRouter", () => {
  describe("getFriends", () => {
    it("should return list of accepted friends", async () => {
      const ctx = createMockContext(TEST_USER_UUID);

      // Mock friendships data
      const mockFriendships = [
        {
          id: TEST_FRIENDSHIP_UUID,
          user_id: TEST_USER_UUID,
          friend_id: TEST_FRIEND_UUID,
          status: "accepted",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Mock profiles data
      const mockProfiles = [
        {
          id: TEST_FRIEND_UUID,
          email: "friend1@example.com",
          display_name: "Friend 1",
          avatar_url: "https://example.com/avatar1.jpg",
        },
      ];

      // Setup mocks
      ctx.supabase.from = vi.fn((table: string) => {
        if (table === "friendships") {
          return {
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: mockFriendships, error: null }),
          } as any;
        }
        if (table === "users") {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          } as any;
        }
        return {} as any;
      });

      const caller = friendshipsRouter.createCaller(ctx as any);
      const result = await caller.getFriends();

      expect(result).toEqual(mockProfiles);
    });

    it("should return empty array when no friends", async () => {
      const ctx = createMockContext(TEST_USER_UUID);

      ctx.supabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      })) as any;

      const caller = friendshipsRouter.createCaller(ctx as any);
      const result = await caller.getFriends();

      expect(result).toEqual([]);
    });
  });

  describe("sendRequest", () => {
    it("should send friend request successfully", async () => {
      const friendEmail = "friend@example.com";
      const ctx = createMockContext(TEST_USER_UUID);

      const mockFriend = {
        id: TEST_FRIEND_UUID,
        email: friendEmail,
      };

      const mockFriendship = {
        id: TEST_FRIENDSHIP_UUID,
        user_id: TEST_USER_UUID,
        friend_id: TEST_FRIEND_UUID,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let callCount = 0;
      ctx.supabase.from = vi.fn((table: string) => {
        if (table === "users") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockFriend, error: null }),
          } as any;
        }
        if (table === "friendships") {
          callCount++;
          if (callCount === 1) {
            // First call: check existing friendship
            return {
              select: vi.fn().mockReturnThis(),
              or: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            } as any;
          } else {
            // Second call: insert new friendship
            return {
              insert: vi.fn().mockReturnThis(),
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: mockFriendship, error: null }),
            } as any;
          }
        }
        return {} as any;
      });

      const caller = friendshipsRouter.createCaller(ctx as any);
      const result = await caller.sendRequest({ friendEmail });

      expect(result).toEqual(mockFriendship);
    });

    it("should throw error when user not found", async () => {
      const ctx = createMockContext(TEST_USER_UUID);

      ctx.supabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
      })) as any;

      const caller = friendshipsRouter.createCaller(ctx as any);

      await expect(
        caller.sendRequest({ friendEmail: "nonexistent@example.com" })
      ).rejects.toThrow("User not found");
    });

    it("should throw error when trying to add yourself", async () => {
      const ctx = createMockContext(TEST_USER_UUID);

      ctx.supabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: TEST_USER_UUID, email: "test@example.com" },
          error: null,
        }),
      })) as any;

      const caller = friendshipsRouter.createCaller(ctx as any);

      await expect(
        caller.sendRequest({ friendEmail: "test@example.com" })
      ).rejects.toThrow("Cannot send friend request to yourself");
    });
  });

  describe("acceptRequest", () => {
    it("should accept friend request successfully", async () => {
      const ctx = createMockContext(TEST_USER_UUID);

      const mockFriendship = {
        id: TEST_FRIENDSHIP_UUID,
        user_id: TEST_FRIEND_UUID,
        friend_id: TEST_USER_UUID,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockUpdatedFriendship = {
        ...mockFriendship,
        status: "accepted",
      };

      let callCount = 0;
      ctx.supabase.from = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          // First call: verify friendship
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockFriendship, error: null }),
          } as any;
        } else {
          // Second call: update friendship
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockUpdatedFriendship, error: null }),
          } as any;
        }
      });

      const caller = friendshipsRouter.createCaller(ctx as any);
      const result = await caller.acceptRequest({ friendshipId: TEST_FRIENDSHIP_UUID });

      expect(result.status).toBe("accepted");
    });

    it("should throw error when request not found", async () => {
      const ctx = createMockContext(TEST_USER_UUID);
      const nonexistentUUID = "550e8400-e29b-41d4-a716-446655440099";

      ctx.supabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
      })) as any;

      const caller = friendshipsRouter.createCaller(ctx as any);

      await expect(
        caller.acceptRequest({ friendshipId: nonexistentUUID })
      ).rejects.toThrow("Friend request not found");
    });
  });

  describe("removeFriend", () => {
    it("should remove friend successfully", async () => {
      const ctx = createMockContext(TEST_USER_UUID);

      ctx.supabase.from = vi.fn(() => ({
        delete: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ error: null }),
      })) as any;

      const caller = friendshipsRouter.createCaller(ctx as any);
      const result = await caller.removeFriend({ friendId: TEST_FRIEND_UUID });

      expect(result.success).toBe(true);
    });
  });
});

