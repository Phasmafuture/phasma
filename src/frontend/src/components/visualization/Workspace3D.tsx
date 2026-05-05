import type { PlaybackController } from "@/hooks/usePlaybackController";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import DeformableTissue from "./DeformableTissue";
import { type ContactPoint, computeContactPoint } from "./tissueInteraction";
import { type ArmPose, computeWorkspacePose } from "./workspacePose";

interface Workspace3DProps {
  playback: PlaybackController;
  totalEpisodes: number;
  robotControls?: RobotControlState;
  onCameraReset?: () => void;
  modelType?: "surgical" | "humanoid";
}

export interface RobotControlState {
  activeArm: "arm1" | "arm2" | "arm3";
  offsets: {
    arm1: { wristYaw: number; wristPitch: number; gripper: number };
    arm2: { wristYaw: number; wristPitch: number; gripper: number };
    arm3: { wristYaw: number; wristPitch: number; gripper: number };
  };
}

export interface Workspace3DHandle {
  captureSnapshot: () => Promise<string>;
  resetCamera: () => void;
}

interface RoboticArmProps {
  playback: PlaybackController;
  totalEpisodes: number;
  armId: "arm1" | "arm2" | "arm3";
  position: [number, number, number];
  robotControls?: RobotControlState;
  onEndEffectorUpdate?: (armId: string, worldPos: THREE.Vector3) => void;
}

function DaVinciArm({
  playback,
  totalEpisodes,
  armId,
  position,
  robotControls,
  onEndEffectorUpdate,
}: RoboticArmProps) {
  const baseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristYawRef = useRef<THREE.Group>(null);
  const wristPitchRef = useRef<THREE.Group>(null);
  const gripper1Ref = useRef<THREE.Mesh>(null);
  const gripper2Ref = useRef<THREE.Mesh>(null);
  const endEffectorRef = useRef<THREE.Group>(null);

  const targetPose = useMemo(() => {
    return computeWorkspacePose(totalEpisodes, playback.currentIndex);
  }, [totalEpisodes, playback.currentIndex]);

  useFrame(() => {
    if (!baseRef.current || !shoulderRef.current || !elbowRef.current) return;
    if (!wristYawRef.current || !wristPitchRef.current) return;
    if (!gripper1Ref.current || !gripper2Ref.current) return;

    const lerpFactor = playback.isPlaying ? 0.1 * playback.speed : 1.0;
    const armPose: ArmPose = targetPose.arms[armId];

    const offsets = robotControls?.offsets[armId] || {
      wristYaw: 0,
      wristPitch: 0,
      gripper: 0,
    };

    baseRef.current.rotation.y = THREE.MathUtils.lerp(
      baseRef.current.rotation.y,
      armPose.baseYaw,
      lerpFactor,
    );

    shoulderRef.current.rotation.z = THREE.MathUtils.lerp(
      shoulderRef.current.rotation.z,
      armPose.shoulderPitch,
      lerpFactor,
    );

    elbowRef.current.rotation.z = THREE.MathUtils.lerp(
      elbowRef.current.rotation.z,
      armPose.elbowPitch,
      lerpFactor,
    );

    wristYawRef.current.rotation.y = THREE.MathUtils.lerp(
      wristYawRef.current.rotation.y,
      armPose.wristYaw + offsets.wristYaw,
      lerpFactor,
    );

    wristPitchRef.current.rotation.z = THREE.MathUtils.lerp(
      wristPitchRef.current.rotation.z,
      armPose.wristPitch + offsets.wristPitch,
      lerpFactor,
    );

    const gripperTarget = Math.max(
      0,
      Math.min(1, armPose.gripperOpen + offsets.gripper),
    );
    const gripperAngle = gripperTarget * 0.3;

    gripper1Ref.current.rotation.z = THREE.MathUtils.lerp(
      gripper1Ref.current.rotation.z,
      gripperAngle,
      lerpFactor,
    );
    gripper2Ref.current.rotation.z = THREE.MathUtils.lerp(
      gripper2Ref.current.rotation.z,
      -gripperAngle,
      lerpFactor,
    );

    if (endEffectorRef.current && onEndEffectorUpdate) {
      const worldPos = new THREE.Vector3();
      endEffectorRef.current.getWorldPosition(worldPos);
      onEndEffectorUpdate(armId, worldPos);
    }
  });

  return (
    <group position={position}>
      <group ref={baseRef}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.2, 16]} />
          <meshStandardMaterial
            color="#d1d5db"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <group ref={shoulderRef} position={[0, 0.2, 0]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial
              color="#e5e7eb"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color="#9ca3af"
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
          <group ref={elbowRef} position={[0, 0.5, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.06, 0.4, 0.06]} />
              <meshStandardMaterial
                color="#d1d5db"
                metalness={0.5}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                color="#9ca3af"
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>
            <group ref={wristYawRef} position={[0, 0.4, 0]}>
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.05, 0.3, 0.05]} />
                <meshStandardMaterial
                  color="#e5e7eb"
                  metalness={0.5}
                  roughness={0.4}
                />
              </mesh>
              <group ref={wristPitchRef} position={[0, 0.3, 0]}>
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} />
                  <meshStandardMaterial
                    color="#9ca3af"
                    metalness={0.6}
                    roughness={0.3}
                  />
                </mesh>
                <mesh position={[0, 0.12, 0]}>
                  <boxGeometry args={[0.06, 0.04, 0.06]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.7}
                    roughness={0.2}
                  />
                </mesh>
                <group ref={endEffectorRef} position={[0, 0.2, 0]} />
                <mesh ref={gripper1Ref} position={[0.02, 0.16, 0]}>
                  <boxGeometry args={[0.02, 0.08, 0.02]} />
                  <meshStandardMaterial
                    color="#f3f4f6"
                    metalness={0.6}
                    roughness={0.3}
                  />
                </mesh>
                <mesh ref={gripper2Ref} position={[-0.02, 0.16, 0]}>
                  <boxGeometry args={[0.02, 0.08, 0.02]} />
                  <meshStandardMaterial
                    color="#f3f4f6"
                    metalness={0.6}
                    roughness={0.3}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function PatientSideCart() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.0, 16]} />
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.04, 16]} />
        <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

function WorkSurface() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[6, 0.1, 3]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.7} />
      </mesh>
      <gridHelper
        args={[6, 18, "#374151", "#1f2937"]}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

// ─── Humanoid Figure ────────────────────────────────────────────────────────

interface HumanoidFigureProps {
  playback: PlaybackController;
  totalEpisodes: number;
}

function HumanoidFigure({ playback, totalEpisodes }: HumanoidFigureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const upperArmLRef = useRef<THREE.Group>(null);
  const lowerArmLRef = useRef<THREE.Group>(null);
  const upperArmRRef = useRef<THREE.Group>(null);
  const lowerArmRRef = useRef<THREE.Group>(null);
  const handLRef = useRef<THREE.Mesh>(null);
  const handRRef = useRef<THREE.Mesh>(null);
  const upperLegLRef = useRef<THREE.Group>(null);
  const upperLegRRef = useRef<THREE.Group>(null);
  const lowerLegLRef = useRef<THREE.Group>(null);
  const lowerLegRRef = useRef<THREE.Group>(null);

  const timeRef = useRef(0);

  const phase = useMemo(() => {
    const pose = computeWorkspacePose(totalEpisodes, playback.currentIndex);
    return pose.phase as "idle" | "approach" | "contact" | "retract";
  }, [totalEpisodes, playback.currentIndex]);

  useFrame((_, delta) => {
    const speed = playback.isPlaying ? playback.speed : 0;
    timeRef.current += delta * speed;
    const t = timeRef.current;

    const lf = 0.08; // lerp factor

    // Phase-driven target angles
    let shoulderTarget = 0;
    let elbowTarget = 0;
    let bobOffset = 0;

    if (phase === "idle") {
      shoulderTarget = 0.15;
      elbowTarget = 0.2;
      bobOffset = Math.sin(t * 1.2) * 0.015;
    } else if (phase === "approach") {
      shoulderTarget = -0.9;
      elbowTarget = -0.5;
      bobOffset = 0;
    } else if (phase === "contact") {
      shoulderTarget = -1.1;
      elbowTarget = -0.2;
      bobOffset = 0;
    } else {
      // retract
      shoulderTarget = 0.3;
      elbowTarget = 0.4;
      bobOffset = Math.sin(t * 0.8) * 0.01;
    }

    if (torsoRef.current) {
      torsoRef.current.position.y = THREE.MathUtils.lerp(
        torsoRef.current.position.y,
        0.72 + bobOffset,
        lf,
      );
    }
    if (headRef.current) {
      headRef.current.position.y = THREE.MathUtils.lerp(
        headRef.current.position.y,
        1.45 + bobOffset,
        lf,
      );
    }

    if (upperArmLRef.current) {
      upperArmLRef.current.rotation.x = THREE.MathUtils.lerp(
        upperArmLRef.current.rotation.x,
        shoulderTarget,
        lf,
      );
    }
    if (upperArmRRef.current) {
      upperArmRRef.current.rotation.x = THREE.MathUtils.lerp(
        upperArmRRef.current.rotation.x,
        shoulderTarget,
        lf,
      );
    }
    if (lowerArmLRef.current) {
      lowerArmLRef.current.rotation.x = THREE.MathUtils.lerp(
        lowerArmLRef.current.rotation.x,
        elbowTarget,
        lf,
      );
    }
    if (lowerArmRRef.current) {
      lowerArmRRef.current.rotation.x = THREE.MathUtils.lerp(
        lowerArmRRef.current.rotation.x,
        elbowTarget,
        lf,
      );
    }

    // Subtle breathing: slight scale variation on torso
    if (torsoRef.current && phase === "idle") {
      const breath = 1 + Math.sin(t * 0.9) * 0.012;
      torsoRef.current.scale.x = breath;
      torsoRef.current.scale.z = breath;
    }
  });

  const wfMat = <meshBasicMaterial color="#cccccc" wireframe />;
  const wfMatDim = <meshBasicMaterial color="#888888" wireframe />;

  return (
    // Positioned at x:-2.5, separate space from surgical robot on right
    <group ref={groupRef} position={[-2.5, 0, 0]}>
      {/* Feet */}
      <mesh position={[-0.12, 0.06, 0.05]}>
        <boxGeometry args={[0.1, 0.06, 0.2]} />
        {wfMatDim}
      </mesh>
      <mesh position={[0.12, 0.06, 0.05]}>
        <boxGeometry args={[0.1, 0.06, 0.2]} />
        {wfMatDim}
      </mesh>

      {/* Lower legs */}
      <group ref={lowerLegLRef} position={[-0.12, 0.09, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.09, 0.38, 0.09]} />
          {wfMatDim}
        </mesh>
      </group>
      <group ref={lowerLegRRef} position={[0.12, 0.09, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.09, 0.38, 0.09]} />
          {wfMatDim}
        </mesh>
      </group>

      {/* Upper legs */}
      <group ref={upperLegLRef} position={[-0.12, 0.48, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.11, 0.38, 0.11]} />
          {wfMatDim}
        </mesh>
      </group>
      <group ref={upperLegRRef} position={[0.12, 0.48, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.11, 0.38, 0.11]} />
          {wfMatDim}
        </mesh>
      </group>

      {/* Hips */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.18]} />
        {wfMat}
      </mesh>

      {/* Torso */}
      <mesh ref={torsoRef} position={[0, 0.72, 0]}>
        <boxGeometry args={[0.36, 0.48, 0.2]} />
        {wfMat}
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.055, 0.065, 0.14, 8]} />
        {wfMat}
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.45, 0]}>
        <boxGeometry args={[0.22, 0.26, 0.22]} />
        {wfMat}
      </mesh>

      {/* Left shoulder */}
      <mesh position={[-0.24, 1.1, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        {wfMat}
      </mesh>
      {/* Right shoulder */}
      <mesh position={[0.24, 1.1, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        {wfMat}
      </mesh>

      {/* Left upper arm */}
      <group ref={upperArmLRef} position={[-0.24, 1.02, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.08, 0.34, 0.08]} />
          {wfMat}
        </mesh>
        {/* Left elbow */}
        <mesh position={[0, -0.37, 0]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          {wfMat}
        </mesh>
        {/* Left lower arm */}
        <group ref={lowerArmLRef} position={[0, -0.37, 0]}>
          <mesh position={[0, -0.16, 0]}>
            <boxGeometry args={[0.065, 0.3, 0.065]} />
            {wfMat}
          </mesh>
          {/* Left hand */}
          <mesh ref={handLRef} position={[0, -0.33, 0]}>
            <boxGeometry args={[0.09, 0.1, 0.06]} />
            {wfMat}
          </mesh>
        </group>
      </group>

      {/* Right upper arm */}
      <group ref={upperArmRRef} position={[0.24, 1.02, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.08, 0.34, 0.08]} />
          {wfMat}
        </mesh>
        {/* Right elbow */}
        <mesh position={[0, -0.37, 0]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          {wfMat}
        </mesh>
        {/* Right lower arm */}
        <group ref={lowerArmRRef} position={[0, -0.37, 0]}>
          <mesh position={[0, -0.16, 0]}>
            <boxGeometry args={[0.065, 0.3, 0.065]} />
            {wfMat}
          </mesh>
          {/* Right hand */}
          <mesh ref={handRRef} position={[0, -0.33, 0]}>
            <boxGeometry args={[0.09, 0.1, 0.06]} />
            {wfMat}
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─── Scene ──────────────────────────────────────────────────────────────────

interface SceneProps extends Workspace3DProps {
  onContactPointsUpdate: (contacts: ContactPoint[]) => void;
}

function Scene({
  playback,
  totalEpisodes,
  robotControls,
  onContactPointsUpdate,
  modelType = "surgical",
}: SceneProps) {
  const endEffectorPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const tissueCenter = useMemo(() => new THREE.Vector3(0.7, 0.15, 0.5), []);

  const targetPose = useMemo(() => {
    return computeWorkspacePose(totalEpisodes, playback.currentIndex);
  }, [totalEpisodes, playback.currentIndex]);

  const handleEndEffectorUpdate = (armId: string, worldPos: THREE.Vector3) => {
    endEffectorPositions.current.set(armId, worldPos.clone());
  };

  const contactPoints = useMemo(() => {
    const contacts: ContactPoint[] = [];
    if (targetPose.phase !== "contact" || modelType !== "surgical") {
      return contacts;
    }
    for (const armId of ["arm1", "arm2", "arm3"]) {
      const armPose = targetPose.arms[armId as keyof typeof targetPose.arms];
      const contact = computeContactPoint(
        armPose.endEffectorPosition,
        tissueCenter,
        0.25,
        0.3,
      );
      if (contact) {
        contacts.push(contact);
      }
    }
    return contacts;
  }, [targetPose, tissueCenter, modelType]);

  useFrame(() => {
    onContactPointsUpdate(contactPoints);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 4, -3]} intensity={0.3} color="#ffffff" />

      {/* Extended work surface — covers both surgical and humanoid zones */}
      <WorkSurface />

      {modelType === "surgical" ? (
        <>
          <PatientSideCart />
          <DaVinciArm
            playback={playback}
            totalEpisodes={totalEpisodes}
            armId="arm1"
            position={[0.25, 1.04, 0]}
            robotControls={robotControls}
            onEndEffectorUpdate={handleEndEffectorUpdate}
          />
          <DaVinciArm
            playback={playback}
            totalEpisodes={totalEpisodes}
            armId="arm2"
            position={[-0.15, 1.04, 0.2]}
            robotControls={robotControls}
            onEndEffectorUpdate={handleEndEffectorUpdate}
          />
          <DaVinciArm
            playback={playback}
            totalEpisodes={totalEpisodes}
            armId="arm3"
            position={[-0.15, 1.04, -0.2]}
            robotControls={robotControls}
            onEndEffectorUpdate={handleEndEffectorUpdate}
          />
          <DeformableTissue
            position={[0.7, 0.15, 0.5]}
            contactPoints={contactPoints}
          />
        </>
      ) : (
        <HumanoidFigure playback={playback} totalEpisodes={totalEpisodes} />
      )}
    </>
  );
}

// ─── Workspace3D ─────────────────────────────────────────────────────────────

const Workspace3D = forwardRef<Workspace3DHandle, Workspace3DProps>(
  (
    {
      playback,
      totalEpisodes,
      robotControls,
      onCameraReset,
      modelType = "surgical",
    },
    ref,
  ) => {
    const controlsRef = useRef<any>(null);
    const contactPointsRef = useRef<ContactPoint[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        resetCamera: () => {
          if (controlsRef.current) {
            controlsRef.current.reset();
          }
        },
        captureSnapshot: async () => {
          if (!canvasRef.current) {
            throw new Error("Canvas not available");
          }
          return canvasRef.current.toDataURL("image/png");
        },
      }),
      [],
    );

    if (onCameraReset && controlsRef.current) {
      (onCameraReset as any).reset = () => {
        if (controlsRef.current) {
          controlsRef.current.reset();
        }
      };
    }

    const handleContactPointsUpdate = (contacts: ContactPoint[]) => {
      contactPointsRef.current = contacts;
    };

    // For humanoid mode, pull camera back further to see the full figure
    const cameraPosition: [number, number, number] =
      modelType === "humanoid" ? [-1.5, 2.5, 4.5] : [3, 3, 3];
    const orbitTarget: [number, number, number] =
      modelType === "humanoid" ? [-2.5, 0.8, 0] : [0, 0.5, 0];

    return (
      <div className="w-full h-[500px] bg-black rounded-lg overflow-hidden border border-white/10">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement;
          }}
        >
          <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2}
            target={orbitTarget}
          />
          <Scene
            playback={playback}
            totalEpisodes={totalEpisodes}
            robotControls={robotControls}
            onContactPointsUpdate={handleContactPointsUpdate}
            modelType={modelType}
          />
          <color attach="background" args={["#000000"]} />
        </Canvas>
      </div>
    );
  },
);

Workspace3D.displayName = "Workspace3D";

export default Workspace3D;
