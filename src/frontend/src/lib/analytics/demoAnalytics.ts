import type { DemoRun } from "../demoRuns";

export interface ProjectUsageSummary {
  totalRuns: number;
  completedRuns: number;
  runningRuns: number;
  totalEpisodes: number;
  recentActivity: {
    runName: string;
    createdAt: string;
  }[];
}

export function computeProjectUsage(runs: DemoRun[]): ProjectUsageSummary {
  const totalRuns = runs.length;
  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const runningRuns = runs.filter((r) => r.status === "running").length;
  const totalEpisodes = runs.reduce((sum, r) => sum + r.totalEpisodes, 0);

  const recentActivity = runs
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((r) => ({
      runName: r.name,
      createdAt: r.createdAt,
    }));

  return {
    totalRuns,
    completedRuns,
    runningRuns,
    totalEpisodes,
    recentActivity,
  };
}

export interface RunCompletionBreakdown {
  completed: number;
  running: number;
}

export function computeRunCompletionBreakdown(
  runs: DemoRun[],
): RunCompletionBreakdown {
  return {
    completed: runs.filter((r) => r.status === "completed").length,
    running: runs.filter((r) => r.status === "running").length,
  };
}
