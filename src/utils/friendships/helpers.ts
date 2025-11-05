import type { Friendship } from "@/types/database.types";

/**
 * Gets friend ID from friendship (opposite to current user)
 */
export const getFriendIdFromFriendship = (
  friendship: Friendship,
  currentUserId: string
): string => {
  return friendship.user_id === currentUserId
    ? friendship.friend_id
    : friendship.user_id;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
