"use client";

import { Suspense, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useInView } from "framer-motion";
import {
  Box3,
  MathUtils,
  Matrix4,
  Object3D,
  Quaternion,
  Sphere,
  Vector3,
  type Group,
  type InstancedMesh,
} from "three";

const MODEL_URL = "/models/hackif-logo.glb";
const EXTRA_COUNT = 22;
const LOGO_SCALE = 1.25;
const BUILD_DURATION = 1.8;
const FINAL_ROTATION_X = MathUtils.degToRad(-4);
const FINAL_ROTATION_Y = MathUtils.degToRad(18);
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const PIECES = [
  "IF_Bola", "IF_F_01", "IF_F_02", "IF_F_03", "IF_F_04", "IF_F_05",
  "IF_F_06", "IF_F_07", "IF_I_01", "IF_I_02", "IF_I_03",
] as const;

const CHAOS_OFFSETS: ReadonlyArray<[number, number, number]> = [
  [-0.9, 0.58, 0.34], [0.72, -0.62, -0.42], [-0.58, -0.2, 0.52],
  [0.86, 0.38, 0.18], [-0.82, 0.08, -0.5], [0.24, 0.72, 0.42],
  [0.58, -0.12, -0.36], [-0.28, -0.72, 0.26], [0.42, 0.2, 0.58],
  [-0.5, 0.5, -0.2], [0.02, -0.42, -0.56],
];

type PieceMotion = {
  object: Object3D;
  finalPosition: Vector3;
  finalRotation: Quaternion;
  sourcePosition: Vector3;
  sourceRotation: Quaternion;
  controlPosition: Vector3;
  radius: number;
  centerOffsetX: number;
  centerOffsetY: number;
  rotationVelocity: [number, number, number];
  start: number;
};

type PointerPosition = { x: number; y: number; active: boolean };

const subscribeReducedMotion = (callback: () => void) => {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => true;

function createPieceSimulation(count: number) {
  const data = new Float32Array(count * 6);
  for (let index = 0; index < count; index++) {
    data[index * 6] = 0.045 + (index % 4) * 0.009;
    data[index * 6 + 1] = (index % 2 ? -1 : 1) * (0.038 + (index % 3) * 0.011);
    data[index * 6 + 2] = (index % 3 - 1) * 0.018;
  }
  return data;
}

function createExtraSimulation() {
  const stride = 10;
  const data = new Float32Array(EXTRA_COUNT * stride);
  for (let index = 0; index < EXTRA_COUNT; index++) {
    const seed = (index * 0.61803398875) % 1;
    const offset = index * stride;
    data[offset] = (seed - 0.5) * 2.2;
    data[offset + 1] = (((index * 0.37) % 1) - 0.5) * 1.65;
    data[offset + 2] = (((index * 0.73) % 1) - 0.5) * 1.1;
    data[offset + 3] = (index % 2 ? -1 : 1) * (0.035 + (index % 5) * 0.007);
    data[offset + 4] = (index % 3 ? 1 : -1) * (0.028 + (index % 4) * 0.008);
    data[offset + 5] = (index % 2 ? 1 : -1) * 0.012;
    data[offset + 6] = seed * Math.PI;
    data[offset + 7] = seed * Math.PI * 1.7;
    data[offset + 8] = seed * Math.PI * 0.7;
    data[offset + 9] = 0.72 + (index % 4) * 0.1;
  }
  return data;
}

function prepareBuild(motions: PieceMotion[]) {
  for (let index = 0; index < motions.length; index++) {
    const motion = motions[index];
    motion.sourcePosition.copy(motion.object.position);
    motion.sourceRotation.copy(motion.object.quaternion);
    motion.controlPosition.copy(motion.sourcePosition).lerp(motion.finalPosition, 0.5);
    motion.controlPosition.x += Math.sin(index * 1.9) * 0.18;
    motion.controlPosition.y += Math.cos(index * 1.4) * 0.14;
    motion.controlPosition.z += Math.sin(index * 2.3) * 0.2;
  }
}

function applyBuildProgress(motions: PieceMotion[], progress: number) {
  for (const motion of motions) {
    const local = MathUtils.clamp((progress - motion.start) / (1 - motion.start), 0, 1);
    const eased = local * local * local * (10 + local * (-15 + 6 * local));
    const remaining = 1 - eased;
    motion.object.position.copy(motion.sourcePosition).multiplyScalar(remaining * remaining)
      .addScaledVector(motion.controlPosition, 2 * remaining * eased)
      .addScaledVector(motion.finalPosition, eased * eased);
    motion.object.quaternion.slerpQuaternions(motion.sourceRotation, motion.finalRotation, eased);
  }
}

function updateChaosPieces(
  motions: PieceMotion[], simulation: Float32Array, center: Vector3,
  halfWidth: number, halfHeight: number, pointer: PointerPosition, delta: number,
) {
  const minZ = -0.62;
  const maxZ = 0.62;
  for (let index = 0; index < motions.length; index++) {
    const motion = motions[index];
    const offset = index * 6;
    const minX = center.x - halfWidth + motion.radius - motion.centerOffsetX;
    const maxX = center.x + halfWidth - motion.radius - motion.centerOffsetX;
    const minY = center.y - halfHeight + motion.radius - motion.centerOffsetY;
    const maxY = center.y + halfHeight - motion.radius - motion.centerOffsetY;
    let velocityX = simulation[offset];
    let velocityY = simulation[offset + 1];
    let velocityZ = simulation[offset + 2];

    if (pointer.active) {
      const pointX = motion.object.position.x + motion.centerOffsetX - center.x;
      const pointY = motion.object.position.y + motion.centerOffsetY - center.y;
      const distanceX = pointX - pointer.x * halfWidth;
      const distanceY = pointY - pointer.y * halfHeight;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;
      if (distanceSquared > 0.001 && distanceSquared < 0.3) {
        const influence = (0.3 - distanceSquared) * delta * 0.18 / Math.sqrt(distanceSquared);
        velocityX += distanceX * influence;
        velocityY += distanceY * influence;
      }
    }

    let nextX = motion.object.position.x + velocityX * delta;
    let nextY = motion.object.position.y + velocityY * delta;
    let nextZ = motion.object.position.z + velocityZ * delta;
    if (nextX <= minX || nextX >= maxX) {
      nextX = MathUtils.clamp(nextX, minX, maxX);
      velocityX *= -1;
    }
    if (nextY <= minY || nextY >= maxY) {
      nextY = MathUtils.clamp(nextY, minY, maxY);
      velocityY *= -1;
    }
    if (nextZ <= minZ || nextZ >= maxZ) {
      nextZ = MathUtils.clamp(nextZ, minZ, maxZ);
      velocityZ *= -1;
    }
    simulation[offset] = MathUtils.clamp(velocityX, -0.11, 0.11);
    simulation[offset + 1] = MathUtils.clamp(velocityY, -0.11, 0.11);
    simulation[offset + 2] = velocityZ;
    motion.object.position.set(nextX, nextY, nextZ);
    motion.object.rotation.x += motion.rotationVelocity[0] * delta;
    motion.object.rotation.y += motion.rotationVelocity[1] * delta;
    motion.object.rotation.z += motion.rotationVelocity[2] * delta;
  }
}

function YourTurnScene({ assembled, active, reducedMotion, pointerRef }: {
  assembled: boolean;
  active: boolean;
  reducedMotion: boolean;
  pointerRef: RefObject<PointerPosition>;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const { viewport, invalidate } = useThree();
  const piecesGroup = useRef<Group>(null);
  const extras = useRef<InstancedMesh>(null);
  const progress = useRef(0);
  const previousTarget = useRef(false);
  const pieceSimulation = useRef(createPieceSimulation(PIECES.length));
  const extraSimulation = useRef(createExtraSimulation());
  const dummy = useMemo(() => new Matrix4(), []);
  const dummyObject = useMemo(() => new Object3D(), []);

  const { instance, center, motions } = useMemo(() => {
    const instance = scene.clone(true);
    const finalBounds = new Box3().setFromObject(instance);
    const center = finalBounds.getCenter(new Vector3());
    const motions: PieceMotion[] = [];

    for (let index = 0; index < PIECES.length; index++) {
      const object = instance.getObjectByName(PIECES[index]);
      if (!object) throw new Error(`Missing GLB object: ${PIECES[index]}`);
      const finalPosition = object.position.clone();
      const finalRotation = object.quaternion.clone();
      const chaos = CHAOS_OFFSETS[index];
      object.position.add(new Vector3(...chaos));
      object.rotation.x += 0.2 + (index % 3) * 0.16;
      object.rotation.y -= 0.18 + (index % 4) * 0.13;
      object.rotation.z += (index % 2 ? -1 : 1) * (0.16 + index * 0.025);
      motions.push({
        object, finalPosition, finalRotation,
        sourcePosition: object.position.clone(), sourceRotation: object.quaternion.clone(),
        controlPosition: object.position.clone(), radius: 0, centerOffsetX: 0, centerOffsetY: 0,
        rotationVelocity: [0.07 + index % 3 * 0.018, -0.06 - index % 4 * 0.014, 0.05 + index % 2 * 0.025],
        start: PIECES[index] === "IF_Bola" ? 0.3 : (index % 4) * 0.035,
      });
    }

    instance.updateMatrixWorld(true);
    for (const motion of motions) {
      const sphere = new Box3().setFromObject(motion.object).getBoundingSphere(new Sphere());
      motion.object.parent?.worldToLocal(sphere.center);
      motion.radius = sphere.radius;
      motion.centerOffsetX = sphere.center.x - motion.object.position.x;
      motion.centerOffsetY = sphere.center.y - motion.object.position.y;
    }
    prepareBuild(motions);
    return { instance, center, motions };
  }, [scene]);
  const motionsRef = useRef(motions);

  useFrame(({ clock }, frameDelta) => {
    if (!active || !piecesGroup.current || !extras.current) return;
    const delta = Math.min(frameDelta, 0.05);
    if (assembled !== previousTarget.current) {
      if (assembled && progress.current === 0) prepareBuild(motionsRef.current);
      previousTarget.current = assembled;
    }

    const duration = reducedMotion ? 0.45 : BUILD_DURATION;
    if (assembled) progress.current = Math.min(1, progress.current + delta / duration);
    else progress.current = Math.max(0, progress.current - delta / duration);
    const easedProgress = progress.current * progress.current * (3 - 2 * progress.current);
    const halfWidth = viewport.width / (2 * LOGO_SCALE) - 0.08;
    const halfHeight = viewport.height / (2 * LOGO_SCALE) - 0.22;

    if (progress.current === 0 && !assembled) {
      if (!reducedMotion) {
        updateChaosPieces(motionsRef.current, pieceSimulation.current, center,
          halfWidth, halfHeight, pointerRef.current, delta);
      }
    } else {
      applyBuildProgress(motionsRef.current, easedProgress);
    }

    const time = clock.elapsedTime;
    piecesGroup.current.position.y = 0.06 + Math.sin(time * 0.7) * 0.018 * easedProgress;
    piecesGroup.current.rotation.x = FINAL_ROTATION_X * easedProgress
      + Math.sin(time * 0.35) * 0.012 * easedProgress;
    piecesGroup.current.rotation.y = FINAL_ROTATION_Y * easedProgress
      + Math.sin(time * 0.28) * 0.018 * easedProgress;

    const extraData = extraSimulation.current;
    const extraHalfWidth = viewport.width / 2 - 0.2;
    const extraHalfHeight = viewport.height / 2 - 0.32;
    for (let index = 0; index < EXTRA_COUNT; index++) {
      const offset = index * 10;
      if (!reducedMotion) {
        if (!assembled && progress.current === 0 && pointerRef.current.active) {
          const distanceX = extraData[offset] - pointerRef.current.x * extraHalfWidth;
          const distanceY = extraData[offset + 1] - pointerRef.current.y * extraHalfHeight;
          const distanceSquared = distanceX * distanceX + distanceY * distanceY;
          if (distanceSquared > 0.001 && distanceSquared < 0.34) {
            const influence = (0.34 - distanceSquared) * delta * 0.16 / Math.sqrt(distanceSquared);
            extraData[offset + 3] = MathUtils.clamp(extraData[offset + 3] + distanceX * influence, -0.1, 0.1);
            extraData[offset + 4] = MathUtils.clamp(extraData[offset + 4] + distanceY * influence, -0.1, 0.1);
          }
        }
        extraData[offset] += extraData[offset + 3] * delta;
        extraData[offset + 1] += extraData[offset + 4] * delta;
        extraData[offset + 2] += extraData[offset + 5] * delta;
        if (Math.abs(extraData[offset]) >= extraHalfWidth) {
          extraData[offset] = MathUtils.clamp(extraData[offset], -extraHalfWidth, extraHalfWidth);
          extraData[offset + 3] *= -1;
        }
        if (Math.abs(extraData[offset + 1]) >= extraHalfHeight) {
          extraData[offset + 1] = MathUtils.clamp(extraData[offset + 1], -extraHalfHeight, extraHalfHeight);
          extraData[offset + 4] *= -1;
        }
        if (Math.abs(extraData[offset + 2]) >= 0.75) extraData[offset + 5] *= -1;
        extraData[offset + 6] += (0.08 + index % 3 * 0.025) * delta;
        extraData[offset + 7] -= (0.06 + index % 4 * 0.02) * delta;
        extraData[offset + 8] += 0.05 * delta;
      }
      const angle = index * 2.39996322973;
      const organizedX = Math.cos(angle) * extraHalfWidth * 0.78 + extraData[offset] * 0.1;
      const organizedY = Math.sin(angle) * extraHalfHeight * 0.76 + extraData[offset + 1] * 0.1;
      dummyObject.position.set(
        MathUtils.clamp(MathUtils.lerp(extraData[offset], organizedX, easedProgress), -extraHalfWidth, extraHalfWidth),
        MathUtils.clamp(MathUtils.lerp(extraData[offset + 1], organizedY, easedProgress), -extraHalfHeight, extraHalfHeight),
        extraData[offset + 2],
      );
      dummyObject.rotation.set(extraData[offset + 6], extraData[offset + 7], extraData[offset + 8]);
      dummyObject.scale.setScalar(extraData[offset + 9]);
      dummyObject.updateMatrix();
      dummy.copy(dummyObject.matrix);
      extras.current.setMatrixAt(index, dummy);
    }
    extras.current.instanceMatrix.needsUpdate = true;

    if (!reducedMotion || progress.current !== (assembled ? 1 : 0)) invalidate();
  });

  return (
    <>
      <group ref={piecesGroup} scale={LOGO_SCALE}>
        <primitive object={instance} position={[-center.x, -center.y, -center.z]} />
      </group>
      <instancedMesh ref={extras} args={[undefined, undefined, EXTRA_COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.15, 0.15, 0.09]} />
        <meshStandardMaterial color="#b6ff00" roughness={0.42} metalness={0.08} />
      </instancedMesh>
    </>
  );
}

export function YourTurn3D() {
  const surfaceRef = useRef<HTMLButtonElement>(null);
  const pointerRef = useRef<PointerPosition>({ x: 0, y: 0, active: false });
  const [assembled, setAssembled] = useState(false);
  const active = useInView(surfaceRef, { amount: 0.1 });
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);

  return (
    <button
      ref={surfaceRef}
      type="button"
      className="relative block min-h-[360px] w-full cursor-pointer appearance-none overflow-hidden border-0 border-l border-t border-accent/16 bg-foreground/[0.012] p-0 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent lg:min-h-[520px]"
      aria-label={assembled ? "Desmontar símbolo do IF" : "Construir símbolo do IF"}
      aria-pressed={assembled}
      onClick={() => setAssembled((value) => !value)}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerRef.current.x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
        pointerRef.current.y = -((event.clientY - bounds.top) / bounds.height * 2 - 1);
        pointerRef.current.active = true;
      }}
      onPointerLeave={() => { pointerRef.current.active = false; }}
    >
      <div
        className="absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 45%, rgba(182,255,0,0.12), transparent 36%), linear-gradient(rgba(182,255,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(182,255,0,0.025) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 64px 64px, 64px 64px",
        }}
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Canvas camera={{ position: [0, 0, 4.2], fov: 35, near: 0.1, far: 20 }}
          dpr={[1, 1.5]} frameloop="demand" gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[3, 4, 5]} intensity={2.2} />
          <directionalLight position={[-3, 1, 3]} color="#b6ff00" intensity={0.35} />
          <Suspense fallback={null}>
            <YourTurnScene assembled={assembled} active={active} reducedMotion={reducedMotion} pointerRef={pointerRef} />
          </Suspense>
        </Canvas>
      </div>
      <span className="absolute bottom-6 left-6 font-display text-[0.72rem] uppercase tracking-[0.08em] text-foreground/35">
        {assembled ? "// CLIQUE PARA DESMONTAR" : "// CLIQUE PARA CONSTRUIR"}
      </span>
    </button>
  );
}

useGLTF.preload(MODEL_URL);
