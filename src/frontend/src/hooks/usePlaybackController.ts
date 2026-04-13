import { useCallback, useEffect, useState } from "react";

export interface PlaybackController {
  isPlaying: boolean;
  currentIndex: number;
  speed: number;
  togglePlay: () => void;
  seek: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

export function usePlaybackController(totalSteps: number): PlaybackController {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isPlaying) return;

    const baseInterval = 50; // 50ms base interval
    const interval = baseInterval / speed;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return totalSteps - 1;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, speed, totalSteps]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const seek = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, totalSteps - 1)));
      setIsPlaying(false);
    },
    [totalSteps],
  );

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    currentIndex,
    speed,
    togglePlay,
    seek,
    reset,
    setSpeed,
  };
}
