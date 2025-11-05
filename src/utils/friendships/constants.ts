/**
 * Error messages for friendship operations
 */
export const FRIENDSHIP_ERROR_MESSAGES = {
  USER_NOT_FOUND: "User not found",
  ALREADY_FRIENDS: "Already friends with this user",
  REQUEST_ALREADY_SENT: "Friend request already sent",
  CANNOT_ADD_YOURSELF: "Cannot send friend request to yourself",
  USER_BLOCKED: "Cannot send friend request to this user",
  REQUEST_NOT_FOUND: "Friend request not found",
  FAILED_TO_SEND: "Failed to send friend request",
  FAILED_TO_ACCEPT: "Failed to accept friend request",
  FAILED_TO_REJECT: "Failed to reject friend request",
  FAILED_TO_REMOVE: "Failed to remove friend",
  FAILED_TO_BLOCK: "Failed to block user",
} as const;
