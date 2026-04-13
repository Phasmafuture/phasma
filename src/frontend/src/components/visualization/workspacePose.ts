export interface ArmPose {
  baseYaw: number;
  shoulderPitch: number;
  elbowPitch: number;
  wristYaw: number;
  wristPitch: number;
  gripperOpen: number; // 0 = closed, 1 = open
  endEffectorPosition: { x: number; y: number; z: number };
}

export interface WorkspacePose {
  arms: {
    arm1: ArmPose;
    arm2: ArmPose;
    arm3: ArmPose;
  };
  phase: "idle" | "approach" | "contact" | "retract";
}

function computeArmPose(
  progress: number,
  cycleProgress: number,
  phase: WorkspacePose["phase"],
  armOffset: number,
): ArmPose {
  // Each arm has a slightly different timing offset
  const _offsetProgress = (cycleProgress + armOffset) % 1.0;

  let baseYaw = progress * Math.PI * 2 * 0.3 + armOffset * Math.PI * 0.5;
  let shoulderPitch = -0.4;
  let elbowPitch = 0.6;
  let wristYaw = 0;
  let wristPitch = -0.3;
  let gripperOpen = 1.0;
  let endEffectorPosition = { x: 0, y: 0.8, z: 0 };

  if (phase === "idle") {
    shoulderPitch = -0.4;
    elbowPitch = 0.6;
    wristPitch = -0.3;
    gripperOpen = 1.0;
  } else if (phase === "approach") {
    const t = (cycleProgress - 0.25) / 0.25;
    shoulderPitch = -0.4 + t * 0.6;
    elbowPitch = 0.6 - t * 0.4;
    wristPitch = -0.3 + t * 0.5;
    wristYaw = t * 0.2;
    gripperOpen = 1.0 - t * 0.3;

    // Move toward tissue target
    endEffectorPosition = {
      x: t * (0.6 + armOffset * 0.3),
      y: 0.8 - t * 0.5,
      z: t * (0.4 + armOffset * 0.2),
    };
  } else if (phase === "contact") {
    shoulderPitch = 0.2;
    elbowPitch = 0.2;
    wristPitch = 0.2;
    wristYaw = 0.2;
    gripperOpen = 0.3;

    // At tissue target with small deterministic penetration modulation
    const contactProgress = (cycleProgress - 0.5) / 0.25;
    const penetrationModulation =
      Math.sin(contactProgress * Math.PI * 4) * 0.05;

    endEffectorPosition = {
      x: 0.6 + armOffset * 0.3,
      y: 0.3 + penetrationModulation,
      z: 0.4 + armOffset * 0.2,
    };
  } else {
    // retract
    const t = (cycleProgress - 0.75) / 0.25;
    shoulderPitch = 0.2 - t * 0.6;
    elbowPitch = 0.2 + t * 0.4;
    wristPitch = 0.2 - t * 0.5;
    wristYaw = 0.2 - t * 0.2;
    gripperOpen = 0.3 + t * 0.7;

    endEffectorPosition = {
      x: (0.6 + armOffset * 0.3) * (1 - t),
      y: 0.3 + t * 0.5,
      z: (0.4 + armOffset * 0.2) * (1 - t),
    };
  }

  return {
    baseYaw,
    shoulderPitch,
    elbowPitch,
    wristYaw,
    wristPitch,
    gripperOpen,
    endEffectorPosition,
  };
}

export function computeWorkspacePose(
  totalEpisodes: number,
  currentIndex: number,
): WorkspacePose {
  // Normalize progress [0, 1]
  const progress = currentIndex / Math.max(1, totalEpisodes - 1);

  // Create a cyclic pattern with 4 phases per cycle
  const cycleLength = 0.1; // Each cycle is 10% of total episodes
  const cycleProgress = (progress % cycleLength) / cycleLength;

  // Determine phase
  let phase: WorkspacePose["phase"] = "idle";
  if (cycleProgress < 0.25) {
    phase = "idle";
  } else if (cycleProgress < 0.5) {
    phase = "approach";
  } else if (cycleProgress < 0.75) {
    phase = "contact";
  } else {
    phase = "retract";
  }

  // Compute poses for each arm with different offsets
  const arm1 = computeArmPose(progress, cycleProgress, phase, 0);
  const arm2 = computeArmPose(progress, cycleProgress, phase, 0.33);
  const arm3 = computeArmPose(progress, cycleProgress, phase, 0.66);

  return {
    arms: {
      arm1,
      arm2,
      arm3,
    },
    phase,
  };
}
