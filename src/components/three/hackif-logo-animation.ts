import { Box3, Euler, Frustum, MathUtils, Matrix3, Matrix4, Quaternion, Vector3, type Camera, type Object3D } from "three";
import type { HackIFLogoParts, HackIFLogoPieceName } from "./HackIFLogoModel";

export const CONSTRUCTION_DURATION = 3.0;

type ScatterConfig = {
  direction: [number, number, number];
  rotation: [number, number, number];
  arc: [number, number, number];
  start: number;
};

// Directions are screen-oriented X/Y plus depth in local model space.
const SCATTER_CONFIG: Record<HackIFLogoPieceName, ScatterConfig> = {
  IF_Bola: { direction: [-0.45, 1, -0.55], rotation: [0.7, -0.85, 0.45], arc: [-0.2, 0.12, -0.16], start: 0.36 },
  IF_F_01: { direction: [0.2, -1, 0.6], rotation: [-0.45, 0.65, -0.5], arc: [0.16, -0.08, 0.14], start: 0.3 },
  IF_F_02: { direction: [0.7, -1, -0.5], rotation: [0.55, -0.4, 0.35], arc: [-0.12, -0.16, -0.1], start: 0.33 },
  IF_F_03: { direction: [1, -0.45, 0.35], rotation: [-0.6, 0.9, -0.35], arc: [0.08, 0.18, 0.12], start: 0.31 },
  IF_F_04: { direction: [1, 0.35, -0.45], rotation: [0.45, 0.5, -0.75], arc: [-0.14, 0.16, -0.08], start: 0.29 },
  IF_F_05: { direction: [0.18, 1, 0.65], rotation: [-0.5, -0.7, 0.4], arc: [0.2, 0.08, 0.14], start: 0.34 },
  IF_F_06: { direction: [1, 0.05, -0.7], rotation: [0.8, 0.4, 0.3], arc: [-0.18, -0.08, -0.12], start: 0.32 },
  IF_F_07: { direction: [0.75, 1, 0.5], rotation: [-0.65, -0.55, -0.4], arc: [0.08, -0.18, 0.1], start: 0.35 },
  IF_I_01: { direction: [-1, 0.25, -0.35], rotation: [0.35, -0.8, 0.55], arc: [-0.18, 0.14, -0.1], start: 0.28 },
  IF_I_02: { direction: [-1, -0.6, 0.45], rotation: [-0.55, 0.45, 0.7], arc: [0.12, -0.16, 0.12], start: 0.31 },
  IF_I_03: { direction: [-0.2, 1, 0.4], rotation: [0.75, -0.35, -0.55], arc: [0.16, 0.12, 0.08], start: 0.33 },
};

const ENTRY_DIRECTIONS: Record<HackIFLogoPieceName, [number, number]> = {
  IF_I_01: [-1, 1],
  IF_F_01: [0, -1],
  IF_I_02: [-1, 0],
  IF_F_02: [-1, -1],
  IF_I_03: [0, 1],
  IF_F_04: [1, 1],
  IF_F_05: [0, 1],
  IF_F_03: [1, -1],
  IF_F_06: [1, 0],
  IF_F_07: [1, 1],
  IF_Bola: [0, 1],
};

type PieceEntry = {
  name: HackIFLogoPieceName;
  offset: [number, number, number];
  rotation: [number, number, number];
  arc: [number, number, number];
};

// Offsets/arcs use GLB units (assembled width ~1.12); rotations use radians.
export const CONSTRUCTION_SEQUENCE: PieceEntry[] = [
  { name: "IF_I_01", offset: [-1.80, 1.35, -2.20], rotation: [0.30, -0.55, 0.26], arc: [-0.08, 0.18, 0.10] },
  { name: "IF_F_01", offset: [0.55, -1.10, -1.40], rotation: [-0.40, 0.65, -0.30], arc: [0.12, 0.14, -0.08] },
  { name: "IF_I_02", offset: [-0.42, -0.25, 0.35], rotation: [0.35, -0.45, 0.40], arc: [0.08, -0.16, -0.12] },
  { name: "IF_F_02", offset: [0.25, -0.65, -3.60], rotation: [-0.50, 0.30, -0.35], arc: [-0.16, 0.06, 0.12] },
  { name: "IF_I_03", offset: [-0.50, 1.90, -1.30], rotation: [0.55, -0.35, 0.30], arc: [0.16, 0.08, -0.10] },
  { name: "IF_F_04", offset: [1.40, 1.85, -1.80], rotation: [0.30, 0.55, -0.40], arc: [-0.10, 0.18, 0.08] },
  { name: "IF_F_05", offset: [0.15, 0.55, -0.75], rotation: [-0.35, -0.60, 0.26], arc: [0.18, -0.04, -0.12] },
  { name: "IF_F_03", offset: [0.30, -0.55, 0.45], rotation: [-0.30, 0.70, -0.45], arc: [-0.06, 0.18, -0.14] },
  { name: "IF_F_06", offset: [0.65, 1.05, -2.80], rotation: [0.45, 0.35, 0.30], arc: [-0.18, 0.06, 0.10] },
  { name: "IF_F_07", offset: [0.85, 1.30, -1.00], rotation: [-0.55, -0.45, -0.30], arc: [0.04, -0.16, -0.08] },
  { name: "IF_Bola", offset: [0.25, 1.65, -3.80], rotation: [0.65, -0.50, 0.35], arc: [0.22, 0.10, -0.18] },
];

export type ConstructionTrack = {
  object: Object3D;
  initialPosition: Vector3;
  sourcePosition: Vector3;
  entryDirection: Vector3;
  entryPlanes: number[];
  controlOffset: Vector3;
  finalPosition: Vector3;
  controlPosition: Vector3;
  initialRotation: Quaternion;
  finalRotation: Quaternion;
  start: number;
  duration: number;
};

export type ScatterTrack = {
  object: Object3D;
  finalPosition: Vector3;
  controlPosition: Vector3;
  targetPosition: Vector3;
  finalRotation: Quaternion;
  targetRotation: Quaternion;
  direction: Vector3;
  exitPlanes: number[];
  controlOffset: Vector3;
  start: number;
};

export function createConstructionTracks(pieces: HackIFLogoParts): ConstructionTrack[] {
  return CONSTRUCTION_SEQUENCE.map(({ name, offset, rotation, arc }, index) => {
    const object = pieces[name];
    const finalPosition = object.position.clone();
    const finalRotation = object.quaternion.clone();
    const initialPosition = finalPosition.clone().add(new Vector3(...offset));
    const [x, y] = ENTRY_DIRECTIONS[name];
    const entryPlanes: number[] = [];
    if (x) entryPlanes.push(x < 0 ? 1 : 0);
    if (y) entryPlanes.push(y < 0 ? 2 : 3);

    return {
      object,
      finalPosition,
      finalRotation,
      initialPosition,
      sourcePosition: initialPosition.clone(),
      entryDirection: new Vector3(x, y, 0),
      entryPlanes,
      controlOffset: new Vector3(...arc),
      controlPosition: initialPosition.clone().lerp(finalPosition, 0.5).add(new Vector3(...arc)),
      initialRotation: finalRotation.clone().multiply(
        new Quaternion().setFromEuler(new Euler(...rotation)),
      ),
      start: index * 0.045,
      duration: name === "IF_Bola" ? 0.55 : 0.50,
    };
  });
}

export function createScatterTracks(pieces: HackIFLogoParts): ScatterTrack[] {
  return CONSTRUCTION_SEQUENCE.map(({ name }) => {
    const object = pieces[name];
    const config = SCATTER_CONFIG[name];
    const [x, y] = config.direction;
    const exitPlanes: number[] = [];
    if (x) exitPlanes.push(x < 0 ? 1 : 0);
    if (y) exitPlanes.push(y < 0 ? 2 : 3);
    const finalPosition = object.position.clone();
    const direction = new Vector3(...config.direction).normalize();

    return {
      object,
      finalPosition,
      controlPosition: finalPosition.clone(),
      targetPosition: finalPosition.clone(),
      finalRotation: object.quaternion.clone(),
      targetRotation: object.quaternion.clone().multiply(
        new Quaternion().setFromEuler(new Euler(...config.rotation)),
      ),
      direction,
      exitPlanes,
      controlOffset: new Vector3(...config.arc),
      start: config.start,
    };
  });
}

export function createOffscreenScatterPlacement(tracks: ScatterTrack[]) {
  const projection = new Matrix4();
  const cameraWorld = new Matrix4();
  const viewProjection = new Matrix4();
  const parentLinear = new Matrix3();
  const frustum = new Frustum();
  const box = new Box3();
  const corner = new Vector3();
  const worldDirection = new Vector3();
  const extent = new Vector3();
  const savedPosition = new Vector3();
  const savedRotation = new Quaternion();

  return (camera: Camera) => {
    if (projection.equals(camera.projectionMatrix) && cameraWorld.equals(camera.matrixWorld)) return;
    projection.copy(camera.projectionMatrix);
    cameraWorld.copy(camera.matrixWorld);
    viewProjection.multiplyMatrices(projection, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(viewProjection, camera.coordinateSystem);

    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];
      savedPosition.copy(track.object.position);
      savedRotation.copy(track.object.quaternion);
      track.object.position.copy(track.finalPosition);
      track.object.quaternion.copy(track.finalRotation);
      track.object.updateWorldMatrix(true, false);
      box.setFromObject(track.object);
      worldDirection.copy(track.direction);
      if (track.object.parent) {
        worldDirection.applyMatrix3(parentLinear.setFromMatrix4(track.object.parent.matrixWorld));
      }
      const margin = box.getSize(extent).length() * (0.65 + (index % 3) * 0.22);
      let distance = 0;

      for (const planeIndex of track.exitPlanes) {
        const plane = frustum.planes[planeIndex];
        const normal = plane.normal;
        corner.set(normal.x >= 0 ? box.max.x : box.min.x,
          normal.y >= 0 ? box.max.y : box.min.y,
          normal.z >= 0 ? box.max.z : box.min.z);
        const outwardSpeed = -normal.dot(worldDirection);
        if (outwardSpeed > 0) {
          distance = Math.max(distance, (plane.distanceToPoint(corner) + margin) / outwardSpeed);
        }
      }

      track.targetPosition.copy(track.finalPosition).addScaledVector(track.direction, distance);
      track.controlPosition.copy(track.finalPosition).lerp(track.targetPosition, 0.48).add(track.controlOffset);
      track.object.position.copy(savedPosition);
      track.object.quaternion.copy(savedRotation);
      track.object.updateWorldMatrix(true, false);
    }
  };
}

export function applyScatterProgress(tracks: ScatterTrack[], progress: number) {
  for (const track of tracks) {
    const t = MathUtils.clamp((progress - track.start) / (1 - track.start), 0, 1);
    const eased = t * t * t * (10 + t * (-15 + 6 * t));

    if (t === 0) {
      track.object.position.copy(track.finalPosition);
      track.object.quaternion.copy(track.finalRotation);
    } else if (t === 1) {
      track.object.position.copy(track.targetPosition);
      track.object.quaternion.copy(track.targetRotation);
    } else {
      const remaining = 1 - eased;
      track.object.position.copy(track.finalPosition).multiplyScalar(remaining * remaining)
        .addScaledVector(track.controlPosition, 2 * remaining * eased)
        .addScaledVector(track.targetPosition, eased * eased);
      track.object.quaternion.slerpQuaternions(track.finalRotation, track.targetRotation, eased);
    }
  }
}

export function createOffscreenPlacement(tracks: ConstructionTrack[]) {
  const projection = new Matrix4();
  const cameraWorld = new Matrix4();
  const viewProjection = new Matrix4();
  const parentLinear = new Matrix3();
  const frustum = new Frustum();
  const box = new Box3();
  const corner = new Vector3();
  const worldDirection = new Vector3();
  const extent = new Vector3();

  return (camera: Camera, progress: number) => {
    if (projection.equals(camera.projectionMatrix) && cameraWorld.equals(camera.matrixWorld)) return;
    projection.copy(camera.projectionMatrix);
    cameraWorld.copy(camera.matrixWorld);
    viewProjection.multiplyMatrices(projection, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(viewProjection, camera.coordinateSystem);

    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];
      // Never change a trajectory once its piece is moving.
      if (progress > track.start) continue;
      track.object.position.copy(track.sourcePosition);
      track.object.quaternion.copy(track.initialRotation);
      track.object.updateWorldMatrix(true, false);
      box.setFromObject(track.object);
      worldDirection.copy(track.entryDirection);
      if (track.object.parent) {
        worldDirection.applyMatrix3(parentLinear.setFromMatrix4(track.object.parent.matrixWorld));
      }
      const margin = box.getSize(extent).length() * (0.3 + (index % 3) * 0.15);
      let distance = 0;

      // The farthest corner must lie outside each selected X/Y frustum plane.
      // This uses the full Hero projection, including its camera view offset.
      for (const planeIndex of track.entryPlanes) {
        const plane = frustum.planes[planeIndex];
        const normal = plane.normal;
        corner.set(normal.x >= 0 ? box.max.x : box.min.x,
          normal.y >= 0 ? box.max.y : box.min.y,
          normal.z >= 0 ? box.max.z : box.min.z);
        const outwardSpeed = -normal.dot(worldDirection);
        if (outwardSpeed <= 0) throw new Error("Entry direction must point outside the camera frustum");
        distance = Math.max(distance, (plane.distanceToPoint(corner) + margin) / outwardSpeed);
      }

      track.initialPosition.copy(track.sourcePosition).addScaledVector(track.entryDirection, distance);
      track.controlPosition.copy(track.initialPosition).lerp(track.finalPosition, 0.5).add(track.controlOffset);
      track.object.position.copy(track.initialPosition);
    }
  };
}

// A deterministic 0..1 progress can later be supplied by scroll instead of time.
export function applyConstructionProgress(tracks: ConstructionTrack[], progress: number) {
  for (const track of tracks) {
    const t = MathUtils.clamp((progress - track.start) / track.duration, 0, 1);
    // Zero velocity/acceleration at both ends; speed peaks early, at t = 1/3.
    const eased = MathUtils.clamp(
      t * t * t * (35 + t * (-105 + t * (126 + t * (-70 + 15 * t)))),
      0, 1,
    );

    if (t === 1) {
      track.object.position.copy(track.finalPosition);
      track.object.quaternion.copy(track.finalRotation);
    } else {
      const remaining = 1 - eased;
      // Quadratic Bezier, evaluated from saved endpoints without frame allocations.
      track.object.position.copy(track.initialPosition).multiplyScalar(remaining * remaining)
        .addScaledVector(track.controlPosition, 2 * remaining * eased)
        .addScaledVector(track.finalPosition, eased * eased);
      track.object.quaternion.slerpQuaternions(track.initialRotation, track.finalRotation, eased);
    }
  }
}
