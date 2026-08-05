import { useCallback, useMemo } from "react";
import {
  useFriends,
  usePendingRequests,
  useSentRequests,
  useUserProfile,
} from "./useUserProfile";

export const FRIENDSHIP_UI_STATUS = {
  SELF: "self",
  FRIEND: "friend",
  PENDING_SENT: "pending_sent",
  PENDING_INCOMING: "pending_incoming",
  NONE: "none",
} as const;

export type FriendshipUiStatus =
  (typeof FRIENDSHIP_UI_STATUS)[keyof typeof FRIENDSHIP_UI_STATUS];

export function useFriendshipStatus() {
  const { user, isLoading: isUserLoading, error: userError } = useUserProfile();
  const isAuthenticated = !!user && !userError;

  const { friends, isLoading: isFriendsLoading } = useFriends({
    enabled: isAuthenticated,
  });
  const { pendingRequests, isLoading: isPendingLoading } = usePendingRequests({
    enabled: isAuthenticated,
  });
  const { sentRequests, isLoading: isSentLoading } = useSentRequests({
    enabled: isAuthenticated,
  });

  const friendIds = useMemo(
    () => new Set(friends.map((friend) => friend.id)),
    [friends]
  );

  const pendingIncomingIds = useMemo(
    () => new Set(pendingRequests.map((request) => request.user_id)),
    [pendingRequests]
  );

  const pendingSentIds = useMemo(
    () => new Set(sentRequests.map((request) => request.friend_id)),
    [sentRequests]
  );

  const getStatusForUserId = useCallback(
    (userId: string): FriendshipUiStatus => {
      if (!user) return FRIENDSHIP_UI_STATUS.NONE;
      if (user.id === userId) return FRIENDSHIP_UI_STATUS.SELF;
      if (friendIds.has(userId)) return FRIENDSHIP_UI_STATUS.FRIEND;
      if (pendingSentIds.has(userId)) return FRIENDSHIP_UI_STATUS.PENDING_SENT;
      if (pendingIncomingIds.has(userId)) {
        return FRIENDSHIP_UI_STATUS.PENDING_INCOMING;
      }
      return FRIENDSHIP_UI_STATUS.NONE;
    },
    [user, friendIds, pendingSentIds, pendingIncomingIds]
  );

  const canSendFriendRequest = useCallback(
    (userId: string) => getStatusForUserId(userId) === FRIENDSHIP_UI_STATUS.NONE,
    [getStatusForUserId]
  );

  return {
    getStatusForUserId,
    canSendFriendRequest,
    isAuthenticated,
    isLoading:
      isUserLoading ||
      (isAuthenticated &&
        (isFriendsLoading || isPendingLoading || isSentLoading)),
  };
}
