import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { PlaybackController } from "@/hooks/usePlaybackController";
import { Pause, Play, RotateCcw } from "lucide-react";

interface PlaybackControlsProps {
  playback: PlaybackController;
  totalSteps: number;
}

export default function PlaybackControls({
  playback,
  totalSteps,
}: PlaybackControlsProps) {
  const progress = (playback.currentIndex / totalSteps) * 100;

  return (
    <div className="space-y-4">
      {/* Timeline Scrubber */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Episode {playback.currentIndex}</span>
          <span className="text-gray-400">{totalSteps} total</span>
        </div>
        <Slider
          value={[playback.currentIndex]}
          min={0}
          max={totalSteps}
          step={1}
          onValueChange={([value]) => playback.seek(value)}
          className="cursor-pointer"
        />
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={playback.togglePlay}
            size="lg"
            className="bg-white text-black hover:bg-gray-200"
          >
            {playback.isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Play
              </>
            )}
          </Button>

          <Button
            onClick={playback.reset}
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Speed:</span>
          <Select
            value={playback.speed.toString()}
            onValueChange={(v) => playback.setSpeed(Number(v))}
          >
            <SelectTrigger className="w-24 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/20">
              <SelectItem value="0.5" className="text-white hover:bg-white/10">
                0.5x
              </SelectItem>
              <SelectItem value="1" className="text-white hover:bg-white/10">
                1x
              </SelectItem>
              <SelectItem value="2" className="text-white hover:bg-white/10">
                2x
              </SelectItem>
              <SelectItem value="4" className="text-white hover:bg-white/10">
                4x
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
