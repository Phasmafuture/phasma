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

    // Apply user offsets if this is the active arm
    const offsets = robotControls?.offsets[armId] || {
      wristYaw: 0,
      wristPitch: 0,
      gripper: 0,
    };

    // Base yaw
    baseRef.current.rotation.y = THREE.MathUtils.lerp(
      baseRef.current.rotation.y,
      armPose.baseYaw,
      lerpFactor,
    );

    // Shoulder pitch
    shoulderRef.current.rotation.z = THREE.MathUtils.lerp(
      shoulderRef.current.rotation.z,
      armPose.shoulderPitch,
      lerpFactor,
    );

    // Elbow pitch
    elbowRef.current.rotation.z = THREE.MathUtils.lerp(
      elbowRef.current.rotation.z,
      armPose.elbowPitch,
      lerpFactor,
    );

    // Wrist yaw (with user offset)
    wristYawRef.current.rotation.y = THREE.MathUtils.lerp(
      wristYawRef.current.rotation.y,
      armPose.wristYaw + offsets.wristYaw,
      lerpFactor,
    );

    // Wrist pitch (with user offset)
    wristPitchRef.current.rotation.z = THREE.MathUtils.lerp(
      wristPitchRef.current.rotation.z,
      armPose.wristPitch + offsets.wristPitch,
      lerpFactor,
    );

    // Gripper (with user offset)
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

    // Compute world position of end effector for tissue interaction
    if (endEffectorRef.current && onEndEffectorUpdate) {
      const worldPos = new THREE.Vector3();
      endEffectorRef.current.getWorldPosition(worldPos);
      onEndEffectorUpdate(armId, worldPos);
    }
  });

  return (
    <group position={position}>
      {/* Base yaw joint */}
      <group ref={baseRef}>
        {/* Base cylinder */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.2, 16]} />
          <meshStandardMaterial
            color="#d1d5db"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Shoulder joint */}
        <group ref={shoulderRef} position={[0, 0.2, 0]}>
          {/* Shoulder link */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial
              color="#e5e7eb"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>

          {/* Shoulder joint sphere */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color="#9ca3af"
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>

          {/* Elbow joint */}
          <group ref={elbowRef} position={[0, 0.5, 0]}>
            {/* Upper arm link */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.06, 0.4, 0.06]} />
              <meshStandardMaterial
                color="#d1d5db"
                metalness={0.5}
                roughness={0.4}
              />
            </mesh>

            {/* Elbow joint sphere */}
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                color="#9ca3af"
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>

            {/* Wrist yaw joint */}
            <group ref={wristYawRef} position={[0, 0.4, 0]}>
              {/* Forearm link */}
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.05, 0.3, 0.05]} />
                <meshStandardMaterial
                  color="#e5e7eb"
                  metalness={0.5}
                  roughness={0.4}
                />
              </mesh>

              {/* Wrist pitch joint */}
              <group ref={wristPitchRef} position={[0, 0.3, 0]}>
                {/* Wrist assembly */}
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} />
                  <meshStandardMaterial
                    color="#9ca3af"
                    metalness={0.6}
                    roughness={0.3}
                  />
                </mesh>

                {/* End effector mount */}
                <mesh position={[0, 0.12, 0]}>
                  <boxGeometry args={[0.06, 0.04, 0.06]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.7}
                    roughness={0.2}
                  />
                </mesh>

                {/* End effector reference point (invisible) */}
                <group ref={endEffectorRef} position={[0, 0.2, 0]} />

                {/* Gripper jaw 1 */}
                <mesh ref={gripper1Ref} position={[0.02, 0.16, 0]}>
                  <boxGeometry args={[0.02, 0.08, 0.02]} />
                  <meshStandardMaterial
                    color="#f3f4f6"
                    metalness={0.6}
                    roughness={0.3}
                  />
                </mesh>

                {/* Gripper jaw 2 */}
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
      {/* Central column */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.0, 16]} />
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Top mounting plate */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Base plate */}
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
      {/* Main work surface */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[3, 12, "#374151", "#1f2937"]}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

interface SceneProps extends Workspace3DProps {
  onContactPointsUpdate: (contacts: ContactPoint[]) => void;
}

function Scene({
  playback,
  totalEpisodes,
  robotControls,
  onContactPointsUpdate,
}: SceneProps) {
  const endEffectorPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const tissueCenter = useMemo(() => new THREE.Vector3(0.7, 0.15, 0.5), []);

  const targetPose = useMemo(() => {
    return computeWorkspacePose(totalEpisodes, playback.currentIndex);
  }, [totalEpisodes, playback.currentIndex]);

  const handleEndEffectorUpdate = (armId: string, worldPos: THREE.Vector3) => {
    endEffectorPositions.current.set(armId, worldPos.clone());
  };

  // Compute contact points from all arms
  const contactPoints = useMemo(() => {
    const contacts: ContactPoint[] = [];

    // Only compute contacts during contact phase
    if (targetPose.phase !== "contact") {
      return contacts;
    }

    // Check each arm for contact
    for (const armId of ["arm1", "arm2", "arm3"]) {
      const armPose = targetPose.arms[armId as keyof typeof targetPose.arms];
      const contact = computeContactPoint(
        armPose.endEffectorPosition,
        tissueCenter,
        0.25, // tissue radius
        0.3, // tissue height
      );

      if (contact) {
        contacts.push(contact);
      }
    }

    return contacts;
  }, [targetPose, tissueCenter]);

  // Update parent with contact points
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

      {/* Scene objects */}
      <WorkSurface />
      <PatientSideCart />

      {/* Three da Vinci-style arms mounted around the cart */}
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

      {/* Deformable tissue with contact-driven deformation */}
      <DeformableTissue
        position={[0.7, 0.15, 0.5]}
        contactPoints={contactPoints}
      />
    </>
  );
}

const Workspace3D = forwardRef<Workspace3DHandle, Workspace3DProps>(
  ({ playback, totalEpisodes, robotControls, onCameraReset }, ref) => {
    const controlsRef = useRef<any>(null);
    const contactPointsRef = useRef<ContactPoint[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Expose camera reset and snapshot capture via ref
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

    // Legacy callback support
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

    return (
      <div className="w-full h-[500px] bg-black rounded-lg overflow-hidden border border-white/10">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement;
          }}
        >
          <PerspectiveCamera makeDefault position={[3, 3, 3]} fov={50} />
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0.5, 0]}
          />
          <Scene
            playback={playback}
            totalEpisodes={totalEpisodes}
            robotControls={robotControls}
            onContactPointsUpdate={handleContactPointsUpdate}
          />
          <color attach="background" args={["#000000"]} />
        </Canvas>
      </div>
    );
  },
);

Workspace3D.displayName = "Workspace3D";

export default Workspace3D;
