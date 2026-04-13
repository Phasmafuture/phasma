interface ActivityEvent {
  type:
    | "page_view"
    | "run_created"
    | "run_viewed"
    | "snapshot_export"
    | "session_start";
  timestamp: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  type: "export_success" | "export_failure" | "render_time";
  timestamp: string;
  value?: number;
  metadata?: Record<string, any>;
}

const ACTIVITY_KEY = "phasma_activity_events";
const PERFORMANCE_KEY = "phasma_performance_metrics";
const MAX_EVENTS = 100;

function getEvents<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEvents<T>(key: string, events: T[]) {
  try {
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save events:", error);
  }
}

export function recordActivity(
  type: ActivityEvent["type"],
  metadata?: Record<string, any>,
) {
  const events = getEvents<ActivityEvent>(ACTIVITY_KEY);
  events.push({
    type,
    timestamp: new Date().toISOString(),
    metadata,
  });
  saveEvents(ACTIVITY_KEY, events);
}

export function recordPerformance(
  type: PerformanceMetric["type"],
  value?: number,
  metadata?: Record<string, any>,
) {
  const metrics = getEvents<PerformanceMetric>(PERFORMANCE_KEY);
  metrics.push({
    type,
    timestamp: new Date().toISOString(),
    value,
    metadata,
  });
  saveEvents(PERFORMANCE_KEY, metrics);
}

export function getActivityEvents(): ActivityEvent[] {
  return getEvents<ActivityEvent>(ACTIVITY_KEY);
}

export function getPerformanceMetrics(): PerformanceMetric[] {
  return getEvents<PerformanceMetric>(PERFORMANCE_KEY);
}

export function getActivitySummary() {
  const events = getActivityEvents();
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentEvents = events.filter((e) => new Date(e.timestamp) > last24h);

  return {
    totalEvents: events.length,
    last24h: recentEvents.length,
    byType: {
      pageViews: events.filter((e) => e.type === "page_view").length,
      runsCreated: events.filter((e) => e.type === "run_created").length,
      runsViewed: events.filter((e) => e.type === "run_viewed").length,
      snapshotExports: events.filter((e) => e.type === "snapshot_export")
        .length,
      sessionStarts: events.filter((e) => e.type === "session_start").length,
    },
    recentActivity: events.slice(-10).reverse(),
  };
}

export function getPerformanceSummary() {
  const metrics = getPerformanceMetrics();

  const exportSuccesses = metrics.filter(
    (m) => m.type === "export_success",
  ).length;
  const exportFailures = metrics.filter(
    (m) => m.type === "export_failure",
  ).length;
  const totalExports = exportSuccesses + exportFailures;
  const successRate =
    totalExports > 0 ? (exportSuccesses / totalExports) * 100 : 0;

  const renderTimes = metrics.filter(
    (m) => m.type === "render_time" && m.value !== undefined,
  );
  const avgRenderTime =
    renderTimes.length > 0
      ? renderTimes.reduce((sum, m) => sum + (m.value || 0), 0) /
        renderTimes.length
      : 0;

  return {
    totalExports,
    exportSuccesses,
    exportFailures,
    successRate,
    avgRenderTime,
    recentMetrics: metrics.slice(-10).reverse(),
  };
}
