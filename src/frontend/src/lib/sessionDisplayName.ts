const PROMPT_SHOWN_KEY = "phasma_username_prompt_shown";

export function hasShownPrompt(): boolean {
  try {
    return sessionStorage.getItem(PROMPT_SHOWN_KEY) === "true";
  } catch {
    return false;
  }
}

export function markPromptShown(): void {
  try {
    sessionStorage.setItem(PROMPT_SHOWN_KEY, "true");
  } catch (error) {
    console.error("Failed to mark prompt shown:", error);
  }
}

export function clearPromptFlag(): void {
  try {
    sessionStorage.removeItem(PROMPT_SHOWN_KEY);
  } catch (error) {
    console.error("Failed to clear prompt flag:", error);
  }
}
