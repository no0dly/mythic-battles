import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { Friendship, UserProfile, FriendshipInsert, FriendshipUpdate } from "@/types/database.types";
import { zUuid } from "../schemas";
import {
  FRIENDSHIP_ERROR_MESSAGES,
  getFriendIdFromFriendship,
  isValidEmail,
} from "@/utils/friendships";

export const friendshipsRouter = router({
  // Get all friends (accepted friendships)
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const { data, error } = await ctx.supabase
      .from("friendships")
      .select("*")
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq("status", "accepted");

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch friends",
      });
    }

    const friendships = (data ?? []) as Friendship[];

    // Get friend IDs and fetch their profiles
    const friendIds = friendships.map((friendship) =>
      getFriendIdFromFriendship(friendship, userId)
    );

    if (friendIds.length === 0) {
      return [];
    }

    const { data: profilesData, error: profilesError } = await ctx.supabase
      .from("users")
      .select("id, email, display_name, avatar_url")
      .in("id", friendIds);

    if (profilesError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch friend profiles",
      });
    }

    type UserProfileSubset = Pick<UserProfile, 'id' | 'email' | 'display_name' | 'avatar_url'>;
    const profiles = (profilesData ?? []) as UserProfileSubset[];

    return profiles;
  }),

  // Get pending friend requests (received)
  getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const { data, error } = await ctx.supabase
      .from("friendships")
      .select("*")
      .eq("friend_id", userId)
      .eq("status", "pending");

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending requests",
      });
    }

    const requests = (data ?? []) as Friendship[];

    // Get sender profiles
    const senderIds = requests.map((request) => request.user_id);

    if (senderIds.length === 0) {
      return [];
    }

    const { data: profilesData, error: profilesError } = await ctx.supabase
      .from("users")
      .select("id, email, display_name, avatar_url")
      .in("id", senderIds);

    if (profilesError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch sender profiles",
      });
    }

    type UserProfileSubset = Pick<UserProfile, 'id' | 'email' | 'display_name' | 'avatar_url'>;
    const profiles = (profilesData ?? []) as UserProfileSubset[];

    return requests.map((request) => ({
      ...request,
      sender: profiles.find((p) => p.id === request.user_id),
    }));
  }),

  // Get sent friend requests (that are still pending)
  getSentRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const { data, error } = await ctx.supabase
      .from("friendships")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending");

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch sent requests",
      });
    }

    const sentRequests = (data ?? []) as Friendship[];

    // Get recipient profiles
    const recipientIds = sentRequests.map((request) => request.friend_id);

    if (recipientIds.length === 0) {
      return [];
    }

    const { data: profilesData, error: profilesError } = await ctx.supabase
      .from("users")
      .select("id, email, display_name, avatar_url")
      .in("id", recipientIds);

    if (profilesError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch recipient profiles",
      });
    }

    type UserProfileSubset = Pick<UserProfile, 'id' | 'email' | 'display_name' | 'avatar_url'>;
    const profiles = (profilesData ?? []) as UserProfileSubset[];

    return sentRequests.map((request) => ({
      ...request,
      recipient: profiles.find((p) => p.id === request.friend_id),
    }));
  }),

  // Send a friend request
  sendRequest: protectedProcedure
    .input(
      z.object({
        friendEmail: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Validate email format
      if (!isValidEmail(input.friendEmail)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid email format",
        });
      }

      // Find user by email
      const { data: friendDataRaw, error: friendError } = await ctx.supabase
        .from("users")
        .select("id, email")
        .eq("email", input.friendEmail)
        .single();

      type UserMinimal = Pick<UserProfile, 'id' | 'email'>;
      const friendData = friendDataRaw as UserMinimal | null;

      if (friendError || !friendData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: FRIENDSHIP_ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      if (friendData.id === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: FRIENDSHIP_ERROR_MESSAGES.CANNOT_ADD_YOURSELF,
        });
      }

      // Check if friendship already exists in either direction
      const { data: existingData, error: checkError } = await ctx.supabase
        .from("friendships")
        .select("*")
        .or(
          `and(user_id.eq.${userId},friend_id.eq.${friendData.id}),and(user_id.eq.${friendData.id},friend_id.eq.${userId})`
        )
        .maybeSingle();

      if (checkError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check existing friendship",
        });
      }

      const existingFriendship = existingData as Friendship | null;

      if (existingFriendship) {
        if (existingFriendship.status === "accepted") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: FRIENDSHIP_ERROR_MESSAGES.ALREADY_FRIENDS,
          });
        }
        if (existingFriendship.status === "pending") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: FRIENDSHIP_ERROR_MESSAGES.REQUEST_ALREADY_SENT,
          });
        }
        if (existingFriendship.status === "blocked") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: FRIENDSHIP_ERROR_MESSAGES.USER_BLOCKED,
          });
        }
      }

      // Create friend request
      const insertData: FriendshipInsert = {
        user_id: userId,
        friend_id: friendData.id,
        status: "pending",
      };

      const { data: newData, error } = await ctx.supabase
        .from("friendships")
        // @ts-expect-error - Supabase SSR client typing issue with Database generic
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: FRIENDSHIP_ERROR_MESSAGES.FAILED_TO_SEND,
        });
      }

      return newData as Friendship;
    }),

  // Accept a friend request
  acceptRequest: protectedProcedure
    .input(
      z.object({
        friendshipId: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify the user is the recipient of the request
      const { data: fetchedData, error: fetchError } = await ctx.supabase
        .from("friendships")
        .select("*")
        .eq("id", input.friendshipId)
        .eq("friend_id", userId)
        .eq("status", "pending")
        .single();

      const friendship = fetchedData as Friendship | null;

      if (fetchError || !friendship) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: FRIENDSHIP_ERROR_MESSAGES.REQUEST_NOT_FOUND,
        });
      }

      // Update status to accepted
      const updateData: FriendshipUpdate = {
        status: "accepted",
      };

      const { data: updatedData, error } = await ctx.supabase
        .from("friendships")
        // @ts-expect-error - Supabase SSR client typing issue with Database generic
        .update(updateData)
        .eq("id", input.friendshipId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: FRIENDSHIP_ERROR_MESSAGES.FAILED_TO_ACCEPT,
        });
      }

      return updatedData as Friendship;
    }),

  // Reject a friend request
  rejectRequest: protectedProcedure
    .input(
      z.object({
        friendshipId: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify the user is the recipient of the request
      const { data: fetchedData, error: fetchError } = await ctx.supabase
        .from("friendships")
        .select("*")
        .eq("id", input.friendshipId)
        .eq("friend_id", userId)
        .eq("status", "pending")
        .single();

      const friendship = fetchedData as Friendship | null;

      if (fetchError || !friendship) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: FRIENDSHIP_ERROR_MESSAGES.REQUEST_NOT_FOUND,
        });
      }

      // Update status to rejected
      const updateData: FriendshipUpdate = {
        status: "rejected",
      };

      const { data: updatedData, error } = await ctx.supabase
        .from("friendships")
        // @ts-expect-error - Supabase SSR client typing issue with Database generic
        .update(updateData)
        .eq("id", input.friendshipId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: FRIENDSHIP_ERROR_MESSAGES.FAILED_TO_REJECT,
        });
      }

      return updatedData as Friendship;
    }),

  // Remove a friend (delete friendship)
  removeFriend: protectedProcedure
    .input(
      z.object({
        friendId: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Delete friendship in either direction
      const { error } = await ctx.supabase
        .from("friendships")
        .delete()
        .or(
          `and(user_id.eq.${userId},friend_id.eq.${input.friendId}),and(user_id.eq.${input.friendId},friend_id.eq.${userId})`
        );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: FRIENDSHIP_ERROR_MESSAGES.FAILED_TO_REMOVE,
        });
      }

      return { success: true };
    }),

  // Block a user
  blockUser: protectedProcedure
    .input(
      z.object({
        userId: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      // Check if friendship exists
      const { data: existingData } = await ctx.supabase
        .from("friendships")
        .select("*")
        .or(
          `and(user_id.eq.${currentUserId},friend_id.eq.${input.userId}),and(user_id.eq.${input.userId},friend_id.eq.${currentUserId})`
        )
        .maybeSingle();

      const existingFriendship = existingData as Friendship | null;

      if (existingFriendship) {
        // Update existing friendship to blocked
        const updateData: FriendshipUpdate = {
          status: "blocked",
        };

        const { data: updatedData, error } = await ctx.supabase
          .from("friendships")
          // @ts-expect-error - Supabase SSR client typing issue with Database generic
          .update(updateData)
          .eq("id", existingFriendship.id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: FRIENDSHIP_ERROR_MESSAGES.FAILED_TO_BLOCK,
          });
        }

        return updatedData as Friendship;
      } else {
        // Create new blocked friendship
        const insertData: FriendshipInsert = {
          user_id: currentUserId,
          friend_id: input.userId,
          status: "blocked",
        };

        const { data: newData, error } = await ctx.supabase
          .from("friendships")
          // @ts-expect-error - Supabase SSR client typing issue with Database generic
          .insert(insertData)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: FRIENDSHIP_ERROR_MESSAGES.FAILED_TO_BLOCK,
          });
        }

        return newData as Friendship;
      }
    }),
});

