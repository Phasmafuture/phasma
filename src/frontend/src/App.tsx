import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import AuthRedirect from "./pages/AuthRedirect";
import Dashboard from "./pages/Dashboard";
import RunDetail from "./pages/RunDetail";
import TrainingRuns from "./pages/TrainingRuns";

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const authRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/redirect",
  component: AuthRedirect,
});

const runsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/runs",
  component: () => (
    <ProtectedRoute>
      <TrainingRuns />
    </ProtectedRoute>
  ),
});

const runDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/runs/$runId",
  component: () => (
    <ProtectedRoute>
      <RunDetail />
    </ProtectedRoute>
  ),
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AdvancedAnalytics,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRedirectRoute,
  runsRoute,
  runDetailRoute,
  analyticsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
