import {
  clearPromptFlag,
  hasShownPrompt,
  markPromptShown,
} from "@/lib/sessionDisplayName";
import { useEffect, useState } from "react";

export function useSessionDisplayName() {
  const [promptShown, setPromptShown] = useState<boolean>(() =>
    hasShownPrompt(),
  );

  const markPromptAsShown = () => {
    markPromptShown();
    setPromptShown(true);
  };

  const clearPrompt = () => {
    clearPromptFlag();
    setPromptShown(false);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setPromptShown(hasShownPrompt());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    promptShown,
    markPromptAsShown,
    clearPrompt,
  };
}
