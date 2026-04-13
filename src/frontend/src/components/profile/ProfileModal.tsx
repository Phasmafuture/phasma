import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string | null;
  onSave: (name: string) => Promise<void>;
  onDismiss?: () => void;
  isSaving?: boolean;
}

export default function ProfileModal({
  open,
  onOpenChange,
  currentUsername,
  onSave,
  onDismiss,
  isSaving = false,
}: ProfileModalProps) {
  const [name, setName] = useState(currentUsername || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = !!currentUsername;

  useEffect(() => {
    if (open) {
      setName(currentUsername || "");
      setError(null);
    }
  }, [open, currentUsername]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Username is required");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }

    if (trimmedName.length > 30) {
      setError("Username must be 30 characters or less");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(trimmedName);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to save username:", err);

      // Check for specific backend error messages
      if (err.message?.includes("cannot be changed")) {
        setError("Username is already set and cannot be changed.");
      } else if (err.message?.includes("too short")) {
        setError("Username is too short. Must be at least 1 character.");
      } else if (err.message?.includes("too long")) {
        setError("Username is too long. Must be 24 characters or less.");
      } else if (err.message?.includes("lowercase letters")) {
        setError(
          "Username must contain only lowercase letters, numbers, hyphens, or underscores.",
        );
      } else if (err.message?.includes("Numeric usernames")) {
        setError("Numeric usernames must be 12 characters or less.");
      } else {
        setError("Failed to save username. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onDismiss) {
      onDismiss();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isReadOnly ? "Your Username" : "Set Your Username"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isReadOnly
              ? "Your username is set and cannot be changed."
              : "Choose a username for your account. This can only be set once."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              disabled={isReadOnly || isSubmitting || isSaving}
              className="bg-black border-white/10 text-white placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={30}
            />
            {!isReadOnly && (
              <p className="text-xs text-gray-500">
                2-30 characters. Lowercase letters, numbers, hyphens, and
                underscores only.
              </p>
            )}
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="bg-red-950/50 border-red-900/50"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {isReadOnly ? (
            <Button
              onClick={handleClose}
              className="bg-white text-black hover:bg-gray-200"
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting || isSaving}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting || isSaving || !name.trim()}
                className="bg-white text-black hover:bg-gray-200 disabled:opacity-50"
              >
                {isSubmitting || isSaving ? "Saving..." : "Save Username"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
