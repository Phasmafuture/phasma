import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  type ContactPoint,
  type VertexState,
  applySpringDeformation,
  computeContactPoint,
  initializeVertexStates,
} from "./tissueInteraction";

interface DeformableTissueProps {
  position: [number, number, number];
  contactPoints: ContactPoint[];
}

export default function DeformableTissue({
  position,
  contactPoints,
}: DeformableTissueProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.CylinderGeometry | null>(null);
  const vertexStatesRef = useRef<VertexState[]>([]);
  const forceVisualizerRef = useRef<THREE.Mesh>(null);

  // Create deformable geometry with higher resolution for smooth deformation
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 32, 16);
    geo.computeVertexNormals();
    geometryRef.current = geo;

    // Initialize vertex states
    vertexStatesRef.current = initializeVertexStates(geo);

    return geo;
  }, []);

  // Compute average contact intensity for force visualization
  const avgContactIntensity = useMemo(() => {
    if (contactPoints.length === 0) return 0;
    return (
      contactPoints.reduce((sum, cp) => sum + cp.intensity, 0) /
      contactPoints.length
    );
  }, [contactPoints]);

  useFrame((_, delta) => {
    if (!meshRef.current || !geometryRef.current) return;

    const positions = geometryRef.current.attributes.position
      .array as Float32Array;

    // Apply spring-based deformation
    applySpringDeformation(
      positions,
      vertexStatesRef.current,
      contactPoints,
      delta,
      8.0, // stiffness
      0.85, // damping
      0.3, // influence radius
    );

    // Mark geometry for update
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.computeVertexNormals();

    // Update force visualizer
    if (forceVisualizerRef.current) {
      const targetOpacity = avgContactIntensity * 0.6;
      const currentOpacity = (
        forceVisualizerRef.current.material as THREE.MeshBasicMaterial
      ).opacity;
      (forceVisualizerRef.current.material as THREE.MeshBasicMaterial).opacity =
        THREE.MathUtils.lerp(currentOpacity, targetOpacity, 0.1);

      // Scale visualizer with intensity
      const targetScale = 1.0 + avgContactIntensity * 0.3;
      forceVisualizerRef.current.scale.setScalar(
        THREE.MathUtils.lerp(
          forceVisualizerRef.current.scale.x,
          targetScale,
          0.1,
        ),
      );
    }
  });

  return (
    <group position={position}>
      {/* Deformable tissue mesh */}
      <mesh ref={meshRef} geometry={geometry} castShadow>
        <meshStandardMaterial
          color="#f3f4f6"
          metalness={0.1}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Force/pressure visualization halo */}
      <mesh
        ref={forceVisualizerRef}
        position={[0, 0.16, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.28, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
