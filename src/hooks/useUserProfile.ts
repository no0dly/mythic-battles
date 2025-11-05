import { api } from "@/trpc/client";
import {
  formatDisplayName,
  getUserInitials,
  hasAvatar,
  getUserRank,
  getRankTranslationKey,
  getRankBadgeVariant,
} from "@/utils/users";

/**
 * Hook to get current user profile
 */
export const useUserProfile = () => {
  const { data, isLoading, error, refetch } =
    api.users.getCurrentUser.useQuery(undefined, {
      select: (user) => {
        if (!user) return user;

        return {
          ...user,
          avatarUrl: user.avatar_url,
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
export const useSearchUsers = (query: string, limit: number = 10) => {
  const { data, isLoading, error } = api.users.searchUsers.useQuery(
    { query, limit },
    {
      enabled: query.length > 0,
      select: (users) =>
        users.map((user) => ({
          ...user,
          avatarUrl: user.avatar_url,
          displayName: formatDisplayName(user.display_name, user.email),
          initials: getUserInitials(user.display_name, user.email),
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
 * Hook to update user statistics
 */
export const useUpdateStatistics = () => {
  const utils = api.useUtils();
  const mutation = api.users.updateStatistics.useMutation({
    onSuccess: () => {
      void utils.users.getCurrentUser.invalidate();
    },
  });

  return {
    updateStatistics: mutation.mutate,
    updateStatisticsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to increment win count
 */
export const useIncrementWin = () => {
  const utils = api.useUtils();
  const mutation = api.users.incrementWin.useMutation({
    onSuccess: () => {
      void utils.users.getCurrentUser.invalidate();
    },
  });

  return {
    incrementWin: mutation.mutate,
    incrementWinAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to increment loss count
 */
export const useIncrementLoss = () => {
  const utils = api.useUtils();
  const mutation = api.users.incrementLoss.useMutation({
    onSuccess: () => {
      void utils.users.getCurrentUser.invalidate();
    },
  });

  return {
    incrementLoss: mutation.mutate,
    incrementLossAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook to get leaderboard
 */
export const useLeaderboard = (limit: number = 10, minGames: number = 5) => {
  const { data, isLoading, error } = api.users.getLeaderboard.useQuery(
    {
      limit,
      minGames,
    },
    {
      select: (users) =>
        users.map((user) => ({
          ...user,
          avatarUrl: user.avatar_url,
          displayName: formatDisplayName(user.display_name, ""),
          initials: getUserInitials(user.display_name, ""),
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
export const useFriends = () => {
  const { data, isLoading, error } = api.friendships.getFriends.useQuery(
    undefined,
    {
      select: (friends) =>
        friends.map((friend) => ({
          ...friend,
          avatarUrl: friend.avatar_url,
          displayName: formatDisplayName(friend.display_name, friend.email),
          initials: getUserInitials(friend.display_name, friend.email),
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
export const usePendingRequests = () => {
  const { data, isLoading, error } =
    api.friendships.getPendingRequests.useQuery(undefined, {
      select: (requests) =>
        requests.map((request) => ({
          ...request,
          sender: request.sender
            ? {
                ...request.sender,
                avatarUrl: request.sender.avatar_url,
                displayName: formatDisplayName(
                  request.sender.display_name,
                  request.sender.email
                ),
                initials: getUserInitials(
                  request.sender.display_name,
                  request.sender.email
                ),
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
export const useSentRequests = () => {
  const { data, isLoading, error } = api.friendships.getSentRequests.useQuery(
    undefined,
    {
      select: (requests) =>
        requests.map((request) => ({
          ...request,
          recipient: request.recipient
            ? {
                ...request.recipient,
                avatarUrl: request.recipient.avatar_url,
                displayName: formatDisplayName(
                  request.recipient.display_name,
                  request.recipient.email
                ),
                initials: getUserInitials(
                  request.recipient.display_name,
                  request.recipient.email
                ),
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

