import * as THREE from "three";

export interface ContactPoint {
  position: THREE.Vector3;
  intensity: number; // 0-1, represents penetration/force magnitude
}

export interface VertexState {
  restPosition: THREE.Vector3;
  currentOffset: THREE.Vector3;
  velocity: THREE.Vector3;
}

/**
 * Compute the indentation depth and contact point for a tool end-effector
 * against a tissue surface (cylindrical geometry centered at tissueCenter).
 */
export function computeContactPoint(
  endEffectorPos: { x: number; y: number; z: number },
  tissueCenter: THREE.Vector3,
  tissueRadius: number,
  tissueHeight: number,
): ContactPoint | null {
  const toolPos = new THREE.Vector3(
    endEffectorPos.x,
    endEffectorPos.y,
    endEffectorPos.z,
  );
  const toTool = toolPos.clone().sub(tissueCenter);

  // Check if tool is within tissue bounding cylinder
  const radialDist = Math.sqrt(toTool.x * toTool.x + toTool.z * toTool.z);
  const verticalDist = Math.abs(toTool.y);

  if (radialDist > tissueRadius * 1.5 || verticalDist > tissueHeight) {
    return null; // No contact
  }

  // Compute penetration depth (simplified: distance from top surface)
  const surfaceY = tissueCenter.y + tissueHeight / 2;
  const penetration = Math.max(0, surfaceY - toolPos.y);

  if (penetration < 0.01) {
    return null; // No meaningful contact
  }

  // Contact point is projected onto tissue surface
  const contactPos = toolPos.clone();
  contactPos.y = surfaceY;

  // Intensity scales with penetration (clamped to reasonable range)
  const intensity = Math.min(1.0, penetration / 0.2);

  return {
    position: contactPos,
    intensity,
  };
}

/**
 * Apply spring-constraint-based deformation to vertices near contact points.
 * Uses radial falloff and damped spring dynamics.
 */
export function applySpringDeformation(
  vertices: Float32Array,
  vertexStates: VertexState[],
  contactPoints: ContactPoint[],
  deltaTime: number,
  stiffness = 8.0,
  damping = 0.85,
  influenceRadius = 0.3,
): void {
  const dt = Math.min(deltaTime, 0.05); // Cap delta time for stability

  for (let i = 0; i < vertexStates.length; i++) {
    const state = vertexStates[i];
    const vx = vertices[i * 3];
    const vy = vertices[i * 3 + 1];
    const vz = vertices[i * 3 + 2];

    // Compute total force from all contact points
    let totalForce = new THREE.Vector3(0, 0, 0);

    for (const contact of contactPoints) {
      const vertexPos = new THREE.Vector3(vx, vy, vz);
      const toVertex = vertexPos.clone().sub(contact.position);
      const dist = toVertex.length();

      if (dist < influenceRadius) {
        // Radial falloff (inverse square with smooth cutoff)
        const falloff = (1 - dist / influenceRadius) ** 2;

        // Push vertex away from contact point (indentation)
        const pushDir = toVertex.clone().normalize();
        const pushMagnitude = contact.intensity * falloff * 0.15;

        // Add downward component for realistic indentation
        const indentForce = new THREE.Vector3(
          pushDir.x * pushMagnitude,
          -contact.intensity * falloff * 0.2,
          pushDir.z * pushMagnitude,
        );

        totalForce.add(indentForce);
      }
    }

    // Spring force toward rest position
    const springForce = state.restPosition
      .clone()
      .sub(new THREE.Vector3(vx, vy, vz))
      .multiplyScalar(stiffness);

    totalForce.add(springForce);

    // Damping
    const dampingForce = state.velocity.clone().multiplyScalar(-damping);
    totalForce.add(dampingForce);

    // Update velocity and position (simple Euler integration)
    state.velocity.add(totalForce.multiplyScalar(dt));
    state.currentOffset.add(state.velocity.clone().multiplyScalar(dt));

    // Apply offset to vertex
    vertices[i * 3] = state.restPosition.x + state.currentOffset.x;
    vertices[i * 3 + 1] = state.restPosition.y + state.currentOffset.y;
    vertices[i * 3 + 2] = state.restPosition.z + state.currentOffset.z;
  }
}

/**
 * Initialize vertex states from geometry.
 */
export function initializeVertexStates(
  geometry: THREE.BufferGeometry,
): VertexState[] {
  const positions = geometry.attributes.position.array as Float32Array;
  const states: VertexState[] = [];

  for (let i = 0; i < positions.length / 3; i++) {
    states.push({
      restPosition: new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      ),
      currentOffset: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
    });
  }

  return states;
}
