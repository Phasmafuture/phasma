import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoRun } from "@/lib/demoRuns";
import {
  type LeaderboardEntry,
  getDemoLeaderboardEntries,
} from "@/lib/leaderboard/demoLeaderboard";
import type { MetricsSeries } from "@/lib/metrics/generateDemoSeries";
import { Trophy } from "lucide-react";
import { useMemo } from "react";

interface RunLeaderboardProps {
  runs: DemoRun[];
  currentRunId: string;
  metrics: MetricsSeries;
  currentIndex: number;
  isPlaying: boolean;
}

interface RankedEntry extends LeaderboardEntry {
  isCurrentRun: boolean;
}

const RANK_MEDALS = ["#1", "#2", "#3"];

export default function RunLeaderboard({
  runs,
  currentRunId,
  metrics,
  currentIndex,
  isPlaying,
}: RunLeaderboardProps) {
  const competitors = useMemo(() => getDemoLeaderboardEntries(), []);

  // Current run's live peak reward up to currentIndex
  const livePeakReward = useMemo(() => {
    if (!metrics.reward.length) return 0;
    const slice = metrics.reward.slice(0, Math.max(1, currentIndex + 1));
    return Math.max(...slice);
  }, [metrics.reward, currentIndex]);

  const currentRun = runs.find((r) => r.id === currentRunId);
  const currentRunName = currentRun?.name || "Default Surgical RL Model";
  const currentRunStatus = currentRun?.status || "running";
  const currentRunEpisodes = currentRun?.totalEpisodes || 1000;

  const rankedEntries = useMemo<RankedEntry[]>(() => {
    const currentEntry: RankedEntry = {
      id: currentRunId,
      name: currentRunName,
      peakReward: livePeakReward,
      totalEpisodes: currentRunEpisodes,
      status: currentRunStatus,
      isCurrentRun: true,
    };

    const allEntries: RankedEntry[] = [
      currentEntry,
      ...competitors.map((c) => ({ ...c, isCurrentRun: false })),
    ];

    return allEntries.sort((a, b) => b.peakReward - a.peakReward).slice(0, 10);
  }, [
    livePeakReward,
    competitors,
    currentRunId,
    currentRunName,
    currentRunEpisodes,
    currentRunStatus,
  ]);

  const currentRunRank = rankedEntries.findIndex((e) => e.isCurrentRun) + 1;

  return (
    <Card className="bg-white/5 border-white/10 mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Your rank:</span>
            <span className="text-white font-bold text-sm">
              #{currentRunRank}
            </span>
            {isPlaying && (
              <Badge className="bg-white text-black text-xs font-bold px-2 py-0.5 animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="leaderboard-table">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-2 text-gray-400 font-medium w-12">
                  Rank
                </th>
                <th className="text-left px-4 py-2 text-gray-400 font-medium">
                  Run Name
                </th>
                <th className="text-right px-4 py-2 text-gray-400 font-medium">
                  Peak Reward
                </th>
                <th className="text-right px-4 py-2 text-gray-400 font-medium hidden sm:table-cell">
                  Episodes
                </th>
                <th className="text-right px-4 py-2 text-gray-400 font-medium hidden sm:table-cell">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedEntries.map((entry, index) => {
                const rank = index + 1;
                const isCurrentRun = entry.isCurrentRun;
                return (
                  <tr
                    key={entry.id}
                    data-ocid={
                      isCurrentRun
                        ? "leaderboard-current-run"
                        : `leaderboard-entry-${rank}`
                    }
                    className={[
                      "border-b border-white/5 transition-colors",
                      isCurrentRun
                        ? "bg-white/10 border-l-2 border-l-white"
                        : "hover:bg-white/5",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "font-mono font-bold text-xs",
                          rank === 1
                            ? "text-white"
                            : rank <= 3
                              ? "text-gray-300"
                              : "text-gray-500",
                        ].join(" ")}
                      >
                        {RANK_MEDALS[rank - 1] ?? `#${rank}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={[
                            "truncate font-medium",
                            isCurrentRun ? "text-white" : "text-gray-300",
                          ].join(" ")}
                        >
                          {entry.name}
                        </span>
                        {isCurrentRun && isPlaying && (
                          <Badge className="bg-white text-black text-[10px] font-bold px-1.5 py-0 h-4 shrink-0 animate-pulse">
                            LIVE
                          </Badge>
                        )}
                        {isCurrentRun && !isPlaying && (
                          <Badge
                            variant="outline"
                            className="border-white/40 text-white text-[10px] px-1.5 py-0 h-4 shrink-0"
                          >
                            YOU
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={[
                          "font-mono tabular-nums",
                          isCurrentRun
                            ? "text-white font-bold"
                            : "text-gray-300",
                        ].join(" ")}
                      >
                        {entry.peakReward.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-gray-400 font-mono tabular-nums">
                        {entry.totalEpisodes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={[
                          "text-[10px] px-1.5",
                          entry.status === "completed"
                            ? "border-white/20 text-gray-400"
                            : "border-white/40 text-white",
                        ].join(" ")}
                      >
                        {entry.status === "completed" ? "Completed" : "Running"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
