import PhasmaLogo from "@/components/brand/PhasmaLogo";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";
import ProfileModal from "@/components/profile/ProfileModal";
import { Button } from "@/components/ui/button";
import WorkspacePlanSwitcher from "@/components/workspace/WorkspacePlanSwitcher";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useSessionDisplayName } from "@/hooks/useSessionDisplayName";
import { useGetUsername, useSetUsername } from "@/hooks/useUsername";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Home,
  LogIn,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouterState();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { promptShown, markPromptAsShown, clearPrompt } =
    useSessionDisplayName();
  const { data: username, isFetched: usernameFetched } = useGetUsername();
  const setUsernameMutation = useSetUsername();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Measure header height for mobile offset
  useHeaderOffset("app-header");

  const currentPath = router.location.pathname;
  const isAuthenticated = !!identity;

  // Normalize username to null if undefined
  const currentUsername = username ?? null;

  // Auto-open profile modal on first authenticated session without a username
  useEffect(() => {
    if (
      isAuthenticated &&
      !currentUsername &&
      !promptShown &&
      usernameFetched
    ) {
      setProfileModalOpen(true);
    }
  }, [isAuthenticated, currentUsername, promptShown, usernameFetched]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      clearPrompt();
      queryClient.clear();
      // Clear plan cache on logout
      try {
        localStorage.removeItem("phasma_workspace_plan_mirror");
      } catch (error) {
        console.error("Failed to clear plan cache:", error);
      }
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleSaveUsername = async (name: string) => {
    await setUsernameMutation.mutateAsync(name);
    if (!promptShown) {
      markPromptAsShown();
    }
  };

  const handleDismissModal = () => {
    if (!promptShown) {
      markPromptAsShown();
    }
  };

  const handleNavigate = (path: string) => {
    navigate({ to: path });
  };

  const displayLabel = currentUsername || "Set Username";

  return (
    <div className="min-h-screen bg-black">
      {/* Header with iOS safe-area support */}
      <header
        id="app-header"
        className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 0px)",
        }}
      >
        <div className="container mx-auto px-4">
          {/* Mobile: compact header with hamburger */}
          <div className="flex items-center justify-between h-16 sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileDrawerOpen(true)}
              className="text-white hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <PhasmaLogo size="small" />
              <span className="text-lg font-bold text-white">PHASMA</span>
            </Link>

            {/* Spacer for visual balance */}
            <div className="w-10" />
          </div>

          {/* Desktop/Tablet: horizontal layout */}
          <div className="hidden sm:flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <PhasmaLogo size="small" />
              <span className="text-xl font-bold text-white">PHASMA</span>
            </Link>

            {/* Navigation and Auth */}
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Link to="/">
                  <Button
                    variant={currentPath === "/" ? "secondary" : "ghost"}
                    size="sm"
                    className={
                      currentPath === "/"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/runs">
                  <Button
                    variant={
                      currentPath.startsWith("/runs") ? "secondary" : "ghost"
                    }
                    size="sm"
                    className={
                      currentPath.startsWith("/runs")
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Training Runs
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button
                    variant={
                      currentPath === "/analytics" ? "secondary" : "ghost"
                    }
                    size="sm"
                    className={
                      currentPath === "/analytics"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              </nav>

              {/* Plan Switcher */}
              {isAuthenticated && (
                <div className="border-l border-white/10 pl-4">
                  <WorkspacePlanSwitcher />
                </div>
              )}

              {/* Auth Controls */}
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => setProfileModalOpen(true)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white hover:bg-white/5"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {displayLabel}
                    </Button>
                    <Button
                      onClick={handleAuth}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleAuth}
                    disabled={isLoggingIn}
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isLoggingIn ? "Signing In..." : "Sign In"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        open={mobileDrawerOpen}
        onOpenChange={setMobileDrawerOpen}
        currentPath={currentPath}
        isAuthenticated={isAuthenticated}
        isLoggingIn={isLoggingIn}
        username={currentUsername}
        onNavigate={handleNavigate}
        onProfileClick={() => setProfileModalOpen(true)}
        onAuthClick={handleAuth}
      />

      {/* Main Content with dynamic offset */}
      <main
        style={{
          paddingTop: "var(--header-offset, 0px)",
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} PHASMA
            </div>
            <div className="text-sm text-gray-400">
              Decentralized Surgical Robotics RL Platform
            </div>
          </div>
        </div>
      </footer>

      {/* Profile Modal */}
      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        currentUsername={currentUsername}
        onSave={handleSaveUsername}
        onDismiss={handleDismissModal}
        isSaving={setUsernameMutation.isPending}
      />
    </div>
  );
}
