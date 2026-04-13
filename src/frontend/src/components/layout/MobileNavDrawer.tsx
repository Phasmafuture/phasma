import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import WorkspacePlanSwitcher from "@/components/workspace/WorkspacePlanSwitcher";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Home,
  LogIn,
  LogOut,
  User,
  X,
} from "lucide-react";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPath: string;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  username: string | null;
  onNavigate: (path: string) => void;
  onProfileClick: () => void;
  onAuthClick: () => void;
}

export default function MobileNavDrawer({
  open,
  onOpenChange,
  currentPath,
  isAuthenticated,
  isLoggingIn,
  username,
  onNavigate,
  onProfileClick,
  onAuthClick,
}: MobileNavDrawerProps) {
  const handleNavClick = (path: string) => {
    onNavigate(path);
    onOpenChange(false);
  };

  const handleProfileClick = () => {
    onProfileClick();
    onOpenChange(false);
  };

  const handleAuthClick = () => {
    onAuthClick();
    if (!isAuthenticated) {
      onOpenChange(false);
    }
  };

  const displayLabel = username || "Set Username";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] bg-black border-white/10 p-0"
      >
        <SheetHeader className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-lg font-bold">
              Menu
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex flex-col p-4 gap-2">
          {/* Navigation Links */}
          <Link to="/" onClick={() => handleNavClick("/")}>
            <Button
              variant={currentPath === "/" ? "secondary" : "ghost"}
              size="lg"
              className={`w-full justify-start ${
                currentPath === "/"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Button>
          </Link>

          <Link to="/runs" onClick={() => handleNavClick("/runs")}>
            <Button
              variant={currentPath.startsWith("/runs") ? "secondary" : "ghost"}
              size="lg"
              className={`w-full justify-start ${
                currentPath.startsWith("/runs")
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity className="w-5 h-5 mr-3" />
              Training Runs
            </Button>
          </Link>

          <Link to="/analytics" onClick={() => handleNavClick("/analytics")}>
            <Button
              variant={currentPath === "/analytics" ? "secondary" : "ghost"}
              size="lg"
              className={`w-full justify-start ${
                currentPath === "/analytics"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Analytics
            </Button>
          </Link>

          {/* Plan Switcher */}
          {isAuthenticated && (
            <div className="border-t border-white/10 pt-4 mt-2">
              <WorkspacePlanSwitcher />
            </div>
          )}

          {/* Auth Controls */}
          <div className="border-t border-white/10 pt-4 mt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={handleProfileClick}
                  variant="ghost"
                  size="lg"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <User className="w-5 h-5 mr-3" />
                  {displayLabel}
                </Button>
                <Button
                  onClick={handleAuthClick}
                  variant="ghost"
                  size="lg"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAuthClick}
                disabled={isLoggingIn}
                size="lg"
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                <LogIn className="w-5 h-5 mr-3" />
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
