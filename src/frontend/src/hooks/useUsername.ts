import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const USERNAME_STORAGE_KEY = "phasma_username";

// Query hook to fetch the caller's username — stored locally (demo)
export function useGetUsername() {
  const query = useQuery<string | null>({
    queryKey: ["username"],
    queryFn: async (): Promise<string | null> => {
      try {
        return localStorage.getItem(USERNAME_STORAGE_KEY) || null;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  return {
    ...query,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
  };
}

// Mutation hook to set the caller's username (once only)
export function useSetUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<void> => {
      // Only set if not already set (immutable)
      const existing = localStorage.getItem(USERNAME_STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(USERNAME_STORAGE_KEY, name);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["username"] });
    },
  });
}
