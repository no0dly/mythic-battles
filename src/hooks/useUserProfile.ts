import { api } from "@/trpc/client";
import {
  formatDisplayName,
  getUserInitials,
  hasAvatar,
  normalizeAvatarUrl,
  getUserRank,
  getRankTranslationKey,
  getRankBadgeVariant,
} from "@/utils/users";
import { SEARCH_DEFAULTS } from "@/utils/users/constants";

/**
 * Hook to get current user profile
 */
export const useUserProfile = () => {
  const { data, isLoading, error, refetch } =
    api.users.getCurrentUser.useQuery(undefined, {
      retry: false,
      select: (user) => {
        if (!user) return user;

        return {
          ...user,
          avatarUrl: normalizeAvatarUrl(user.avatar_url),
          displayName: formatDisplayName(user.display_name, user.email),
          initials: getUserInitials(user.display_name, user.email),
          showAvatar: hasAvatar(user.avatar_url),
          rank: getUserRank(user.statistics),
          rankKey: getRankTranslationKey(getUserRank(user.statistics)),
          rankVariant: getRankBadgeVariant(getUserRank(user.statistics)),
        };
      },
    });

  return {
    user: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const utils = api.useUtils();
  const mutation = api.users.updateProfile.useMutation({
    onSuccess: () => {
      void utils.users.getCurrentUser.invalidate();
    },
  });

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to get user by ID
 */
export const useUser = (userId: string) => {
  const { data, isLoading, error } = api.users.getUserById.useQuery({
    userId,
  });

  return {
    user: data,
    isLoading,
    error,
  };
};

/**
 * Hook to search users
 */
export const useSearchUsers = (
  query: string,
  limit: number = SEARCH_DEFAULTS.LIMIT,
  options?: { enabled?: boolean }
) => {
  const { data, isLoading, error } = api.users.searchUsers.useQuery(
    { query, limit },
    {
      enabled:
        (options?.enabled ?? true) &&
        query.length >= SEARCH_DEFAULTS.MIN_QUERY_LENGTH,
      select: (users) =>
        users.map((user) => ({
          ...user,
          avatarUrl: normalizeAvatarUrl(user.avatar_url),
          displayName: formatDisplayName(user.display_name),
          initials: getUserInitials(user.display_name),
          showAvatar: hasAvatar(user.avatar_url),
        })),
    }
  );

  return {
    users: data ?? [],
    isLoading,
    error,
  };
};

/**
 * Hook to get leaderboard
 */
export const useLeaderboard = (limit: number = 10, minGames: number = 0) => {
  const { data, isLoading, error } = api.users.getLeaderboard.useQuery(
    {
      limit,
      minGames,
    },
    {
      select: (users) =>
        users.map((user) => ({
          ...user,
          avatarUrl: normalizeAvatarUrl(user.avatar_url),
          displayName: formatDisplayName(user.display_name),
          initials: getUserInitials(user.display_name),
          showAvatar: hasAvatar(user.avatar_url),
          rank: getUserRank(user.statistics),
          rankKey: getRankTranslationKey(getUserRank(user.statistics)),
          rankVariant: getRankBadgeVariant(getUserRank(user.statistics)),
        })),
    }
  );

  return {
    leaderboard: data ?? [],
    isLoading,
    error,
  };
};

/**
 * Hook to get friends list
 */
export const useFriends = (options?: { enabled?: boolean }) => {
  const { data, isLoading, error } = api.friendships.getFriends.useQuery(
    undefined,
    {
      enabled: options?.enabled ?? true,
      select: (friends) =>
        friends.map((friend) => ({
          ...friend,
          avatarUrl: normalizeAvatarUrl(friend.avatar_url),
          displayName: formatDisplayName(friend.display_name),
          initials: getUserInitials(friend.display_name),
          showAvatar: hasAvatar(friend.avatar_url),
        })),
    }
  );

  return {
    friends: data ?? [],
    isLoading,
    error,
  };
};

/**
 * Hook to get pending friend requests
 */
export const usePendingRequests = (options?: { enabled?: boolean }) => {
  const { data, isLoading, error } =
    api.friendships.getPendingRequests.useQuery(undefined, {
      enabled: options?.enabled ?? true,
      select: (requests) =>
        requests.map((request) => ({
          ...request,
          sender: request.sender
            ? {
                ...request.sender,
                avatarUrl: normalizeAvatarUrl(request.sender.avatar_url),
                displayName: formatDisplayName(request.sender.display_name),
                initials: getUserInitials(request.sender.display_name),
                showAvatar: hasAvatar(request.sender.avatar_url),
              }
            : undefined,
        })),
    });

  return {
    pendingRequests: data ?? [],
    isLoading,
    error,
  };
};

/**
 * Hook to get sent friend requests
 */
export const useSentRequests = (options?: { enabled?: boolean }) => {
  const { data, isLoading, error } = api.friendships.getSentRequests.useQuery(
    undefined,
    {
      enabled: options?.enabled ?? true,
      select: (requests) =>
        requests.map((request) => ({
          ...request,
          recipient: request.recipient
            ? {
                ...request.recipient,
                avatarUrl: normalizeAvatarUrl(request.recipient.avatar_url),
                displayName: formatDisplayName(request.recipient.display_name),
                initials: getUserInitials(request.recipient.display_name),
                showAvatar: hasAvatar(request.recipient.avatar_url),
              }
            : undefined,
        })),
    }
  );

  return {
    sentRequests: data ?? [],
    isLoading,
    error,
  };
};

