/**
 * Generates a filesystem-safe filename from a run name and timestamp
 */
export function generateSnapshotFilename(runName: string): string {
  // Sanitize run name for filesystem
  const safeName = runName
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 50);

  // Generate timestamp
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").substring(0, 19);

  return `${safeName}_${timestamp}.png`;
}
