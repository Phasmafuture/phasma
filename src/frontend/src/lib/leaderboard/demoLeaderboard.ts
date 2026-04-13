export interface LeaderboardEntry {
  id: string;
  name: string;
  peakReward: number;
  totalEpisodes: number;
  status: "completed" | "running";
}

const COMPETITOR_NAMES = [
  "Run Alpha",
  "Run Beta",
  "Run Gamma",
  "Run Delta",
  "Run Epsilon",
  "Run Zeta",
  "Run Eta",
  "Run Theta",
  "Run Iota",
];

// Deterministic seeded values spread between 0.35 and 0.92 (mapped to reward range)
// The reward array in generateDemoSeries starts at -50 and increments ~0.15/episode over 1000 eps
// Peak reward for 1000 episodes ≈ -50 + 1000 * 0.15 ≈ 100
// We map competitor peaks to a spread across realistic range
const COMPETITOR_PEAKS = [
  88.4, // Alpha   — strong
  74.1, // Beta    — above avg
  95.7, // Gamma   — best competitor
  62.3, // Delta   — mid
  51.8, // Epsilon — below avg
  83.2, // Zeta    — strong
  41.5, // Eta     — low
  79.6, // Theta   — above avg
  67.9, // Iota    — mid
];

const COMPETITOR_EPISODES = [200, 150, 200, 100, 80, 180, 60, 160, 120];

export function getDemoLeaderboardEntries(): LeaderboardEntry[] {
  return COMPETITOR_NAMES.map((name, i) => ({
    id: `competitor-${i}`,
    name,
    peakReward: COMPETITOR_PEAKS[i],
    totalEpisodes: COMPETITOR_EPISODES[i],
    status: "completed",
  }));
}
