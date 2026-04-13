import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AuthRedirect() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const { login, identity, loginStatus, isInitializing } =
    useInternetIdentity();
  const [hasTriggeredLogin, setHasTriggeredLogin] = useState(false);

  const returnTo = search.returnTo || "/runs";

  useEffect(() => {
    // Wait for auth to initialize
    if (isInitializing) return;

    // If already authenticated, redirect immediately
    if (identity) {
      navigate({ to: returnTo });
      return;
    }

    // Trigger login once when ready
    if (!hasTriggeredLogin && loginStatus === "idle") {
      setHasTriggeredLogin(true);
      login();
    }
  }, [
    identity,
    loginStatus,
    isInitializing,
    hasTriggeredLogin,
    login,
    navigate,
    returnTo,
  ]);

  // Redirect on successful login
  useEffect(() => {
    if (loginStatus === "success" && identity) {
      navigate({ to: returnTo });
    }
  }, [loginStatus, identity, navigate, returnTo]);

  const handleRetry = () => {
    setHasTriggeredLogin(false);
  };

  // Show error state if login failed
  if (loginStatus === "loginError") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">
            Authentication Failed
          </h2>
          <p className="text-gray-400">
            Unable to sign in with Internet Identity. Please try again.
          </p>
          <Button
            onClick={handleRetry}
            className="bg-white text-black hover:bg-gray-200"
          >
            Retry Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while initializing or logging in
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          {isInitializing ? "Initializing..." : "Signing In..."}
        </h2>
        <p className="text-gray-400">
          {isInitializing
            ? "Please wait while we prepare authentication."
            : "Redirecting to Internet Identity..."}
        </p>
      </div>
    </div>
  );
}
