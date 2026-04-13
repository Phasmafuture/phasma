import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Sparkles } from "lucide-react";

interface CreateDemoRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRun: (name: string, description: string) => void;
}

const DEFAULT_MODEL_NAME = "Default Surgical RL Model";

export default function CreateDemoRunDialog({
  open,
  onOpenChange,
  onCreateRun,
}: CreateDemoRunDialogProps) {
  const handleCreate = () => {
    onCreateRun(DEFAULT_MODEL_NAME, "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Demo Run</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a simulated training run with precomputed metrics for
            visualization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white mb-1">
                Using Predefined Model
              </p>
              <p className="text-sm text-gray-400">
                This demo run will use the{" "}
                <span className="font-medium text-white">
                  {DEFAULT_MODEL_NAME}
                </span>{" "}
                configuration.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              This will create a demo run with simulated data. No actual RL
              training will be performed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            className="bg-white text-black hover:bg-gray-200"
          >
            Create Demo Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
