import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface CreateDemoRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRun: (
    name: string,
    description: string,
    modelType: "surgical" | "humanoid",
  ) => void;
}

const MODELS = [
  {
    id: "surgical" as const,
    name: "Default Surgical RL Model",
    description:
      "Three-arm da Vinci-style robotic system trained on laparoscopic surgical tasks with tool-tissue interaction feedback.",
    icon: (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="w-8 h-8"
        aria-hidden="true"
      >
        {/* Surgical arm icon - stylized robotic arm */}
        <circle cx="20" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="20"
          y1="11"
          x2="20"
          y2="18"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="20" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="20"
          y1="22"
          x2="14"
          y2="30"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="22"
          x2="26"
          y2="30"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="14"
          y1="30"
          x2="12"
          y2="35"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="14"
          y1="30"
          x2="16"
          y2="35"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="26"
          y1="30"
          x2="24"
          y2="35"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="26"
          y1="30"
          x2="28"
          y2="35"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: "humanoid" as const,
    name: "Humanoid RL Model",
    description:
      "Full-body humanoid agent trained on dexterous manipulation tasks. Low-poly wireframe visualization with bilateral arm symmetry.",
    icon: (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="w-8 h-8"
        aria-hidden="true"
      >
        {/* Humanoid icon - person silhouette */}
        <circle cx="20" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="20"
          y1="11"
          x2="20"
          y2="24"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="14"
          x2="12"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="14"
          x2="28"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="12"
          y1="20"
          x2="10"
          y2="26"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="28"
          y1="20"
          x2="30"
          y2="26"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="24"
          x2="15"
          y2="34"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="24"
          x2="25"
          y2="34"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

export default function CreateDemoRunDialog({
  open,
  onOpenChange,
  onCreateRun,
}: CreateDemoRunDialogProps) {
  const [selectedModel, setSelectedModel] = useState<"surgical" | "humanoid">(
    "surgical",
  );

  const handleCreate = () => {
    const model = MODELS.find((m) => m.id === selectedModel)!;
    onCreateRun(model.name, "", selectedModel);
    onOpenChange(false);
  };

  const selected = MODELS.find((m) => m.id === selectedModel)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Demo Run</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a model for your simulated training run
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Model selection cards */}
          <div className="grid grid-cols-2 gap-3">
            {MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                data-ocid={`model_select.${model.id}`}
                onClick={() => setSelectedModel(model.id)}
                className={[
                  "flex flex-col items-center gap-3 p-4 rounded-lg border text-center transition-all duration-200 cursor-pointer",
                  selectedModel === model.id
                    ? "border-white bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                    : "border-white/15 bg-white/3 hover:bg-white/7 hover:border-white/30",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex items-center justify-center w-12 h-12 rounded-md",
                    selectedModel === model.id ? "text-white" : "text-gray-400",
                  ].join(" ")}
                >
                  {model.icon}
                </div>
                <span
                  className={[
                    "text-sm font-medium leading-snug",
                    selectedModel === model.id ? "text-white" : "text-gray-400",
                  ].join(" ")}
                >
                  {model.name}
                </span>
                {selectedModel === model.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>

          {/* Selected model description */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg min-h-[56px]">
            <p className="text-xs text-gray-400 leading-relaxed">
              {selected.description}
            </p>
          </div>

          {/* Demo disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              Demo run only — simulated data. No actual RL training is
              performed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-ocid="create_run.cancel_button"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            data-ocid="create_run.submit_button"
            className="bg-white text-black hover:bg-gray-200"
          >
            Create Demo Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
