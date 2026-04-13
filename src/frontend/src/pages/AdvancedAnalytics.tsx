import LockedSection from "@/components/analytics/LockedSection";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspacePlan } from "@/hooks/useWorkspacePlan";
import {
  computeProjectUsage,
  computeRunCompletionBreakdown,
} from "@/lib/analytics/demoAnalytics";
import {
  getActivitySummary,
  getPerformanceSummary,
} from "@/lib/analytics/localActivityStore";
import { useDemoRuns } from "@/lib/demoRuns";
import {
  Activity,
  BarChart3,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  PlayCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo } from "react";

export default function AdvancedAnalytics() {
  const { isPro, isFree } = useWorkspacePlan();
  const { runs } = useDemoRuns();

  const projectUsage = useMemo(() => computeProjectUsage(runs), [runs]);
  const completionBreakdown = useMemo(
    () => computeRunCompletionBreakdown(runs),
    [runs],
  );
  const activitySummary = useMemo(() => getActivitySummary(), []);
  const performanceSummary = useMemo(() => getPerformanceSummary(), []);

  // Chart data for completion breakdown
  const chartData = [
    {
      label: "Completed",
      value: completionBreakdown.completed,
      color: "rgb(255, 255, 255)",
    },
    {
      label: "Running",
      value: completionBreakdown.running,
      color: "rgb(156, 163, 175)",
    },
  ];

  const maxValue = Math.max(
    completionBreakdown.completed,
    completionBreakdown.running,
    1,
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Advanced Analytics
              </h1>
              <p className="text-gray-400">
                Comprehensive insights into your training runs and activity
              </p>
            </div>
            <Badge
              variant={isPro ? "default" : "outline"}
              className={
                isPro
                  ? "bg-white/20 text-white border-white/30"
                  : "border-white/30 text-gray-300"
              }
            >
              <Zap className="w-3 h-3 mr-1" />
              {isPro ? "Pro" : "Free Preview"}
            </Badge>
          </div>
          {isFree && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-white">Demo Mode:</span>{" "}
                You're viewing a preview of Pro analytics. Some sections are
                locked. Upgrade to Pro to unlock all features.
              </p>
            </div>
          )}
        </div>

        {/* Project Usage Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Project Usage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Runs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {projectUsage.totalRuns}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {projectUsage.completedRuns}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  Running
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {projectUsage.runningRuns}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Episodes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {projectUsage.totalEpisodes.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Run Completion Breakdown
          </h2>
          <LockedSection title="Pro Charts">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Completion Status</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribution of completed vs running training runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {item.value}
                        </span>
                      </div>
                      <div className="w-full h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${(item.value / maxValue) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </LockedSection>
        </div>

        {/* User Activity Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Activity
          </h2>
          <LockedSection title="Pro Activity Tracking">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Activity Summary</CardTitle>
                  <CardDescription className="text-gray-400">
                    Last 24 hours (Demo data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Page Views
                      </span>
                      <span className="text-lg font-semibold text-white">
                        {activitySummary.byType.pageViews}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Runs Created
                      </span>
                      <span className="text-lg font-semibold text-white">
                        {activitySummary.byType.runsCreated}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Runs Viewed
                      </span>
                      <span className="text-lg font-semibold text-white">
                        {activitySummary.byType.runsViewed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Snapshot Exports
                      </span>
                      <span className="text-lg font-semibold text-white">
                        {activitySummary.byType.snapshotExports}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">
                    Latest user actions (Demo data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activitySummary.recentActivity.length > 0 ? (
                      activitySummary.recentActivity
                        .slice(0, 5)
                        .map((event) => (
                          <div
                            key={`${event.type}-${event.timestamp}`}
                            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                          >
                            <span className="text-sm text-gray-300 capitalize">
                              {event.type.replace("_", " ")}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No recent activity
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </LockedSection>
        </div>

        {/* Performance Metrics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Metrics
          </h2>
          <LockedSection title="Pro Performance Insights">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Export Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {performanceSummary.successRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {performanceSummary.totalExports} total exports
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Successful Exports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {performanceSummary.exportSuccesses}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Avg Render Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {performanceSummary.avgRenderTime > 0
                      ? `${performanceSummary.avgRenderTime.toFixed(0)}ms`
                      : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </LockedSection>
        </div>

        {/* Recent Runs */}
        {projectUsage.recentActivity.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Training Runs
            </h2>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {projectUsage.recentActivity.map((activity) => (
                    <div
                      key={`${activity.runName}-${activity.createdAt}`}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <span className="text-sm text-white">
                        {activity.runName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
