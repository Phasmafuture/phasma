import LineChartMono from "@/components/charts/LineChartMono";
import PolicyComparisonChart from "@/components/charts/PolicyComparisonChart";
import RunLeaderboard from "@/components/leaderboard/RunLeaderboard";
import PlaybackControls from "@/components/playback/PlaybackControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RobotControlsPanel from "@/components/visualization/RobotControlsPanel";
import Workspace3D, {
  type RobotControlState,
  type Workspace3DHandle,
} from "@/components/visualization/Workspace3D";
import { usePlaybackController } from "@/hooks/usePlaybackController";
import {
  recordActivity,
  recordPerformance,
} from "@/lib/analytics/localActivityStore";
import { useDemoRuns } from "@/lib/demoRuns";
import { generateDemoSeries } from "@/lib/metrics/generateDemoSeries";
import { generateDemoSnapshot } from "@/utils/demoSnapshotExport";
import { Link, useParams } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  Camera,
  GitCompare,
  Info,
  RotateCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function RunDetail() {
  const { runId } = useParams({ from: "/runs/$runId" });
  const { runs } = useDemoRuns();
  const run = runs.find((r) => r.id === runId);
  const modelType = run?.modelType ?? "surgical";

  // Record page view
  useEffect(() => {
    if (run) {
      recordActivity("run_viewed", { runId, runName: run.name });
    }
  }, [run, runId]);

  const metrics = useMemo(() => {
    if (!run) return null;
    return generateDemoSeries(run.totalEpisodes);
  }, [run]);

  const playback = usePlaybackController(run?.totalEpisodes || 1000);
  const workspace3DRef = useRef<Workspace3DHandle>(null);

  // Chart refs for snapshot export
  const rewardChartRef = useRef<SVGSVGElement>(null);
  const lossChartRef = useRef<SVGSVGElement>(null);
  const successChartRef = useRef<SVGSVGElement>(null);
  const policyChartRef = useRef<SVGSVGElement>(null);

  // Robot control state
  const [robotControls, setRobotControls] = useState<RobotControlState>({
    activeArm: "arm1",
    offsets: {
      arm1: { wristYaw: 0, wristPitch: 0, gripper: 0 },
      arm2: { wristYaw: 0, wristPitch: 0, gripper: 0 },
      arm3: { wristYaw: 0, wristPitch: 0, gripper: 0 },
    },
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleResetRobotControls = () => {
    setRobotControls({
      activeArm: "arm1",
      offsets: {
        arm1: { wristYaw: 0, wristPitch: 0, gripper: 0 },
        arm2: { wristYaw: 0, wristPitch: 0, gripper: 0 },
        arm3: { wristYaw: 0, wristPitch: 0, gripper: 0 },
      },
    });
  };

  const handleCameraReset = () => {
    if (workspace3DRef.current) {
      workspace3DRef.current.resetCamera();
    }
  };

  const handleDemoSnapshot = async () => {
    if (!run || !workspace3DRef.current) return;

    setIsExporting(true);
    recordActivity("snapshot_export", { runId, runName: run.name });
    const startTime = performance.now();

    try {
      // Capture 3D workspace
      const workspace3DImage = await workspace3DRef.current.captureSnapshot();

      // Generate snapshot
      await generateDemoSnapshot({
        runName: run.name,
        currentEpisode: playback.currentIndex,
        totalEpisodes: run.totalEpisodes,
        workspace3DImage,
        rewardChartSvg: rewardChartRef.current,
        lossChartSvg: lossChartRef.current,
        successChartSvg: successChartRef.current,
        policyChartSvg: policyChartRef.current,
      });

      const renderTime = performance.now() - startTime;
      recordPerformance("export_success", renderTime);
      toast.success("Demo snapshot exported successfully");
    } catch (error) {
      console.error("Failed to export demo snapshot:", error);
      recordPerformance("export_failure");
      toast.error("Failed to export demo snapshot");
    } finally {
      setIsExporting(false);
    }
  };

  if (!run || !metrics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Training run not found</p>
          <Link to="/runs">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back to Runs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentReward = metrics.reward.slice(0, playback.currentIndex + 1);
  const currentLoss = metrics.loss.slice(0, playback.currentIndex + 1);
  const currentSuccess = metrics.successRate.slice(
    0,
    playback.currentIndex + 1,
  );
  const currentPolicy1 = metrics.policy1.slice(0, playback.currentIndex + 1);
  const currentPolicy2 = metrics.policy2.slice(0, playback.currentIndex + 1);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/runs">
            <Button
              variant="ghost"
              className="mb-4 text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Runs
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{run.name}</h1>
              {run.description && (
                <p className="text-gray-400 mb-4">{run.description}</p>
              )}
              <div className="flex items-center gap-4">
                <Badge
                  variant={run.status === "completed" ? "default" : "outline"}
                  className={
                    run.status === "completed"
                      ? "bg-white/20 text-white border-white/30"
                      : "border-white/30 text-gray-300"
                  }
                >
                  {run.status === "completed" ? "Completed" : "Running"}
                </Badge>
                <span className="text-sm text-gray-400">
                  {run.totalEpisodes} episodes
                </span>
                <span className="text-sm text-gray-400">
                  Created {new Date(run.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button
              onClick={handleDemoSnapshot}
              disabled={isExporting}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Camera className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Demo Snapshot"}
            </Button>
          </div>
        </div>

        {/* Playback Controls */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardContent className="p-6">
            <PlaybackControls
              playback={playback}
              totalSteps={run.totalEpisodes}
            />
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <RunLeaderboard
          runs={runs}
          currentRunId={run.id}
          metrics={metrics}
          currentIndex={playback.currentIndex}
          isPlaying={playback.isPlaying}
        />

        {/* 3D Workspace and Robot Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">3D Workspace</CardTitle>
                  <CardDescription className="text-gray-400">
                    {modelType === "humanoid"
                      ? "Humanoid agent visualization"
                      : "Interactive surgical robot visualization"}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCameraReset}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Camera
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Workspace3D
                ref={workspace3DRef}
                playback={playback}
                totalEpisodes={run.totalEpisodes}
                robotControls={robotControls}
                modelType={modelType}
              />
            </CardContent>
          </Card>

          {modelType === "surgical" ? (
            <RobotControlsPanel
              controls={robotControls}
              onControlsChange={setRobotControls}
              onReset={handleResetRobotControls}
            />
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Humanoid Agent
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Full-body humanoid RL agent. Arms and posture animate in sync
                  with the training playback phases.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-widest">
                    Active Model
                  </p>
                  <p className="text-sm text-white">Humanoid RL Model</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-widest">
                    Animation Phases
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["idle", "approach", "contact", "retract"].map((ph) => (
                      <div
                        key={ph}
                        className="px-2 py-1 rounded bg-white/5 border border-white/10"
                      >
                        <span className="text-xs text-gray-300 capitalize">
                          {ph}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Metrics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Reward
              </CardTitle>
              <CardDescription className="text-gray-400">
                Episode {playback.currentIndex + 1} / {run.totalEpisodes}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartMono
                ref={rewardChartRef}
                data={currentReward}
                label="Reward"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Loss
              </CardTitle>
              <CardDescription className="text-gray-400">
                Training loss over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartMono
                ref={lossChartRef}
                data={currentLoss}
                label="Loss"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Success Rate
              </CardTitle>
              <CardDescription className="text-gray-400">
                Task completion percentage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartMono
                ref={successChartRef}
                data={currentSuccess}
                label="Success Rate"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GitCompare className="w-5 h-5" />
                Policy Comparison
              </CardTitle>
              <CardDescription className="text-gray-400">
                Policy A vs Policy B performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PolicyComparisonChart
                ref={policyChartRef}
                policy1Data={currentPolicy1}
                policy2Data={currentPolicy2}
              />
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-white">
                  Demo Environment:
                </span>{" "}
                All metrics are precomputed for visualization. The 3D workspace
                and robot controls are interactive simulations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
