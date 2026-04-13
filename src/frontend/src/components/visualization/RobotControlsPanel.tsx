import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RotateCcw } from "lucide-react";
import type { RobotControlState } from "./Workspace3D";

interface RobotControlsPanelProps {
  controls: RobotControlState;
  onControlsChange: (controls: RobotControlState) => void;
  onReset: () => void;
}

export default function RobotControlsPanel({
  controls,
  onControlsChange,
  onReset,
}: RobotControlsPanelProps) {
  const activeArmOffsets = controls.offsets[controls.activeArm];

  const handleArmChange = (armId: "arm1" | "arm2" | "arm3") => {
    onControlsChange({
      ...controls,
      activeArm: armId,
    });
  };

  const handleWristYawChange = (value: number[]) => {
    onControlsChange({
      ...controls,
      offsets: {
        ...controls.offsets,
        [controls.activeArm]: {
          ...activeArmOffsets,
          wristYaw: value[0],
        },
      },
    });
  };

  const handleWristPitchChange = (value: number[]) => {
    onControlsChange({
      ...controls,
      offsets: {
        ...controls.offsets,
        [controls.activeArm]: {
          ...activeArmOffsets,
          wristPitch: value[0],
        },
      },
    });
  };

  const handleGripperChange = (value: number[]) => {
    onControlsChange({
      ...controls,
      offsets: {
        ...controls.offsets,
        [controls.activeArm]: {
          ...activeArmOffsets,
          gripper: value[0],
        },
      },
    });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Robot Controls</CardTitle>
            <CardDescription className="text-gray-400">
              Adjust joint offsets on top of playback animation
            </CardDescription>
          </div>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Controls
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Arm Selection */}
        <div className="space-y-2">
          <Label className="text-white">Active Arm</Label>
          <Select value={controls.activeArm} onValueChange={handleArmChange}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="arm1" className="text-white hover:bg-white/10">
                Arm 1
              </SelectItem>
              <SelectItem value="arm2" className="text-white hover:bg-white/10">
                Arm 2
              </SelectItem>
              <SelectItem value="arm3" className="text-white hover:bg-white/10">
                Arm 3
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Wrist Yaw Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white">Wrist Yaw Offset</Label>
            <span className="text-sm text-gray-400">
              {activeArmOffsets.wristYaw.toFixed(2)} rad
            </span>
          </div>
          <Slider
            value={[activeArmOffsets.wristYaw]}
            onValueChange={handleWristYawChange}
            min={-0.5}
            max={0.5}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Wrist Pitch Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white">Wrist Pitch Offset</Label>
            <span className="text-sm text-gray-400">
              {activeArmOffsets.wristPitch.toFixed(2)} rad
            </span>
          </div>
          <Slider
            value={[activeArmOffsets.wristPitch]}
            onValueChange={handleWristPitchChange}
            min={-0.5}
            max={0.5}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Gripper Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white">Gripper Offset</Label>
            <span className="text-sm text-gray-400">
              {activeArmOffsets.gripper > 0
                ? "Open"
                : activeArmOffsets.gripper < 0
                  ? "Close"
                  : "Neutral"}{" "}
              ({activeArmOffsets.gripper.toFixed(2)})
            </span>
          </div>
          <Slider
            value={[activeArmOffsets.gripper]}
            onValueChange={handleGripperChange}
            min={-0.5}
            max={0.5}
            step={0.01}
            className="w-full"
          />
        </div>

        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-white">Note:</span> Controls
            apply offsets on top of the playback-driven animation. Reset
            playback to restart the animation sequence.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
