import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useWorkspacePlan } from "@/hooks/useWorkspacePlan";
import { WorkspacePlan } from "@/types/workspacePlan";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function WorkspacePlanSwitcher() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { isPro, selectPlan, isSelecting } = useWorkspacePlan();

  const handleTogglePlan = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to switch plans");
      return;
    }

    try {
      const newPlan = isPro ? WorkspacePlan.free : WorkspacePlan.pro;
      await selectPlan(newPlan);
      toast.success(
        `Switched to ${newPlan === WorkspacePlan.pro ? "Pro" : "Free"} plan`,
      );
    } catch (error) {
      console.error("Failed to switch plan:", error);
      toast.error("Failed to switch plan");
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap
              className={`w-4 h-4 ${isPro ? "text-white" : "text-gray-400"}`}
            />
            <span className="text-sm font-medium text-white">
              {isPro ? "Pro" : "Free"}
            </span>
            <Badge
              variant="outline"
              className="border-white/20 text-gray-400 text-xs"
            >
              Demo
            </Badge>
          </div>
          <Button
            onClick={handleTogglePlan}
            disabled={!isAuthenticated || isSelecting}
            size="sm"
            variant={isPro ? "outline" : "default"}
            className={
              isPro
                ? "border-white/20 text-white hover:bg-white/10"
                : "bg-white text-black hover:bg-gray-200"
            }
          >
            {isSelecting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Switching...
              </>
            ) : isPro ? (
              "Switch to Free"
            ) : (
              "Upgrade to Pro"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
