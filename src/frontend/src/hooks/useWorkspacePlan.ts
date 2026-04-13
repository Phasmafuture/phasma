import { useEffect } from "react";
import { WorkspacePlan } from "../types/workspacePlan";
import { useInternetIdentity } from "./useInternetIdentity";
import {
  useGetCallerWorkspacePlan,
  useSelectWorkspacePlan,
} from "./useQueries";

const STORAGE_KEY = "phasma_workspace_plan_mirror";

export function useWorkspacePlan() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: plan, isLoading, isFetched } = useGetCallerWorkspacePlan();
  const selectPlanMutation = useSelectWorkspacePlan();

  // Mirror to localStorage for smoother reload
  useEffect(() => {
    if (plan && isAuthenticated) {
      try {
        localStorage.setItem(STORAGE_KEY, plan);
      } catch (error) {
        console.error("Failed to mirror plan to localStorage:", error);
      }
    }
  }, [plan, isAuthenticated]);

  // Get cached plan for immediate display
  const getCachedPlan = (): WorkspacePlan => {
    if (!isAuthenticated) return WorkspacePlan.free;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return (cached as WorkspacePlan) || WorkspacePlan.free;
    } catch {
      return WorkspacePlan.free;
    }
  };

  const currentPlan = plan || getCachedPlan();

  const selectPlan = async (newPlan: WorkspacePlan) => {
    if (!isAuthenticated) {
      throw new Error("Must be authenticated to select a plan");
    }
    await selectPlanMutation.mutateAsync(newPlan);
  };

  const isPro = currentPlan === WorkspacePlan.pro;
  const isFree = currentPlan === WorkspacePlan.free;

  return {
    plan: currentPlan,
    isPro,
    isFree,
    isLoading,
    isFetched,
    selectPlan,
    isSelecting: selectPlanMutation.isPending,
  };
}
