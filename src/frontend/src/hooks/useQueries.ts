import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkspacePlan } from "../types/workspacePlan";

const PLAN_STORAGE_KEY = "phasma_workspace_plan";

// Workspace Plan Queries — demo-only, stored in localStorage
export function useGetCallerWorkspacePlan() {
  const query = useQuery<WorkspacePlan>({
    queryKey: ["workspacePlan"],
    queryFn: async (): Promise<WorkspacePlan> => {
      try {
        const stored = localStorage.getItem(PLAN_STORAGE_KEY);
        return (stored === "pro" ? "pro" : "free") as WorkspacePlan;
      } catch {
        return "free";
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

export function useSelectWorkspacePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: WorkspacePlan): Promise<void> => {
      try {
        localStorage.setItem(PLAN_STORAGE_KEY, plan);
      } catch {
        // ignore storage errors
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspacePlan"] });
    },
  });
}

// Re-export username hooks for convenience
export { useGetUsername, useSetUsername } from "./useUsername";
