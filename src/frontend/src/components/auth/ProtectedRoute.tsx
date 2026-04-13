import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const router = useRouterState();
  const { identity, isInitializing } = useInternetIdentity();

  const currentPath = router.location.pathname;

  useEffect(() => {
    // Wait for initialization to complete
    if (isInitializing) return;

    // If not authenticated, redirect to auth page with return URL
    if (!identity) {
      navigate({
        to: "/auth/redirect",
        search: { returnTo: currentPath },
      });
    }
  }, [identity, isInitializing, navigate, currentPath]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!identity) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
