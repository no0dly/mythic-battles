import { api } from "@/trpc/client";

/**
 * Hook to get current user profile
 */
export const useUserProfile = () => {
  const { data, isLoading, error, refetch } =
    api.users.getCurrentUser.useQuery();

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
  const { data, isLoading, error } = api.users.getLeaderboard.useQuery({
    limit,
    minGames,
  });

  return {
    leaderboard: data ?? [],
    isLoading,
    error,
  };
};

