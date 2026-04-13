import { useEffect, useState } from "react";

export interface DemoRun {
  id: string;
  name: string;
  description: string;
  status: "running" | "completed";
  totalEpisodes: number;
  createdAt: string;
}

const STORAGE_KEY = "phasma_demo_runs";

function loadRuns(): DemoRun[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRuns(runs: DemoRun[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  } catch (error) {
    console.error("Failed to save runs:", error);
  }
}

export function useDemoRuns() {
  const [runs, setRuns] = useState<DemoRun[]>(loadRuns);

  useEffect(() => {
    saveRuns(runs);
  }, [runs]);

  const createRun = (name: string, description: string) => {
    const newRun: DemoRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      status: "completed",
      totalEpisodes: 1000,
      createdAt: new Date().toISOString(),
    };
    setRuns((prev) => [newRun, ...prev]);
  };

  return { runs, createRun };
}
