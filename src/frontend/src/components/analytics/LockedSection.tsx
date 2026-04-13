import { Button } from "@/components/ui/button";
import { useWorkspacePlan } from "@/hooks/useWorkspacePlan";
import { WorkspacePlan } from "@/types/workspacePlan";
import { Lock, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

interface LockedSectionProps {
  children: ReactNode;
  title?: string;
}

export default function LockedSection({
  children,
  title = "Pro Feature",
}: LockedSectionProps) {
  const { isPro, selectPlan, isSelecting } = useWorkspacePlan();

  const handleUpgrade = async () => {
    try {
      await selectPlan(WorkspacePlan.pro);
      toast.success("Upgraded to Pro plan");
    } catch (error) {
      console.error("Failed to upgrade:", error);
      toast.error("Failed to upgrade to Pro");
    }
  };

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-center p-6 max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-4">
            Upgrade to Pro to unlock advanced analytics and insights
          </p>
          <Button
            onClick={handleUpgrade}
            disabled={isSelecting}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isSelecting ? "Upgrading..." : "Upgrade to Pro (Demo)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
