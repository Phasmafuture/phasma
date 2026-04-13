// Local WorkspacePlan type — demo-only, not backed by canister
export type WorkspacePlan = "free" | "pro";

export const WorkspacePlan = {
  free: "free" as WorkspacePlan,
  pro: "pro" as WorkspacePlan,
} as const;
