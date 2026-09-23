"use client";

import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  PointsMaterial,
  Sphere,
  Vector3,
  type Group,
  type Object3D,
} from "three";

const MODEL_URL = "/models/hackif-logo.glb";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const PIECES = [
  "IF_Bola", "IF_F_01", "IF_F_02", "IF_F_03", "IF_F_04", "IF_F_05",
  "IF_F_06", "IF_F_07", "IF_I_01", "IF_I_02", "IF_I_03",
] as const;

type PieceName = (typeof PIECES)[number];
type PiecePose = { position?: [number, number, number]; rotation?: [number, number, number] };
type StageConfig = { visible: readonly PieceName[]; poses: Partial<Record<PieceName, PiecePose>>; scale: number };
type FloatingPiece = {
  object: Object3D;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  radius: number;
  centerOffsetX: number;
  centerOffsetY: number;
};

const IDEA_MOTION = [
  [0.052, 0.074, 0.1, 0.14, -0.08],
  [-0.068, 0.045, -0.12, 0.09, 0.15],
  [0.081, -0.052, 0.08, -0.13, 0.11],
  [-0.047, -0.079, 0.15, 0.07, -0.1],
  [0.073, 0.058, -0.09, -0.11, 0.13],
] as const;
const SOLUTION_ROTATION_X = MathUtils.degToRad(-4);
const SOLUTION_ROTATION_Y = MathUtils.degToRad(20);

function createIdeaSimulation() {
  const simulation = new Float32Array(IDEA_MOTION.length * 6);
  IDEA_MOTION.forEach((motion, index) => {
    simulation[index * 6] = motion[0];
    simulation[index * 6 + 1] = motion[1];
  });
  return simulation;
}

const STAGES: readonly StageConfig[] = [
  {
    visible: ["IF_Bola", "IF_F_02", "IF_F_06", "IF_I_02", "IF_I_03"],
    scale: 0.74,
    poses: {
      IF_Bola: { position: [-0.44, 0.18, 0.22], rotation: [0.4, -0.5, -0.35] },
      IF_F_02: { position: [0.38, 0.3, -0.18], rotation: [-0.3, 0.45, 0.5] },
      IF_F_06: { position: [-0.3, -0.36, -0.12], rotation: [0.5, 0.3, -0.55] },
      IF_I_02: { position: [0.46, -0.2, 0.16], rotation: [-0.25, -0.45, 0.35] },
      IF_I_03: { position: [0.04, -0.5, 0.28], rotation: [0.35, 0.2, 0.7] },
    },
  },
  {
    visible: ["IF_Bola", "IF_F_01", "IF_F_02", "IF_F_04", "IF_F_06", "IF_I_01", "IF_I_02", "IF_I_03"],
    scale: 0.76,
    poses: {
      IF_Bola: { position: [-0.23, 0.12, 0.15], rotation: [0.18, -0.2, -0.12] },
      IF_F_01: { position: [0.2, 0.16, -0.08], rotation: [0.05, 0.18, 0.16] },
      IF_F_02: { position: [0.34, 0.09, 0.04], rotation: [-0.12, 0.15, -0.1] },
      IF_F_04: { position: [-0.18, -0.12, -0.12], rotation: [0.1, -0.2, 0.2] },
      IF_F_06: { position: [0.25, -0.25, 0.14], rotation: [-0.18, 0.2, -0.2] },
      IF_I_01: { position: [-0.3, 0.04, 0.08], rotation: [0.12, -0.15, 0.12] },
      IF_I_02: { position: [-0.22, -0.3, -0.06], rotation: [-0.08, 0.22, 0.18] },
      IF_I_03: { position: [0.08, -0.4, 0.1], rotation: [0.2, -0.1, -0.24] },
    },
  },
  {
    visible: PIECES.filter((name) => name !== "IF_F_07"),
    scale: 0.79,
    poses: {
      IF_Bola: { position: [-0.08, 0.04, 0.07], rotation: [0.08, -0.08, -0.05] },
      IF_F_03: { position: [0.09, 0.05, -0.04], rotation: [0.04, 0.08, 0.07] },
      IF_F_06: { position: [0.12, -0.08, 0.06], rotation: [-0.06, 0.1, -0.08] },
      IF_I_02: { position: [-0.09, -0.05, -0.03], rotation: [0.05, -0.08, 0.06] },
      IF_I_03: { position: [0.1, -0.11, 0.08], rotation: [-0.08, 0.06, -0.1] },
    },
  },
  { visible: PIECES, poses: {}, scale: 0.82 },
];

const subscribeReducedMotion = (callback: () => void) => {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => true;

function StageParticles() {
  const geometry = useMemo(() => {
    const positions = new Float32Array([
      -0.48, -0.5, 0.08, -0.3, -0.42, -0.08, -0.08, -0.55, 0.14,
      0.18, -0.48, -0.12, 0.4, -0.36, 0.1, 0.53, -0.52, -0.04,
      -0.42, 0.12, -0.16, 0.46, 0.22, -0.12,
    ]);
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(positions, 3));
    return result;
  }, []);
  const material = useMemo(() => new PointsMaterial({
    color: new Color("#b6ff00"), size: 0.025, transparent: true, opacity: 0.6,
    depthWrite: false, sizeAttenuation: true,
  }), []);

  return <points geometry={geometry} material={material} />;
}

function ProcessStage({ index, anchors, active, reducedMotion, surfaceRef }: {
  index: number;
  anchors: RefObject<Array<HTMLDivElement | null>>;
  active: boolean;
  reducedMotion: boolean;
  surfaceRef: RefObject<HTMLDivElement | null>;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef<Group>(null);
  const model = useRef<Group>(null);
  const { size, invalidate } = useThree();
  const motionBoundsReady = useRef(false);
  const { instance, center, extent, floatingPieces } = useMemo(() => {
    const instance = scene.clone(true);
    const config = STAGES[index];
    for (const name of PIECES) {
      const piece = instance.getObjectByName(name);
      if (!piece) throw new Error(`Missing GLB object: ${name}`);
      piece.visible = config.visible.includes(name);
      const pose = config.poses[name];
      if (pose?.position) piece.position.add(new Vector3(...pose.position));
      if (pose?.rotation) {
        piece.rotation.x += pose.rotation[0];
        piece.rotation.y += pose.rotation[1];
        piece.rotation.z += pose.rotation[2];
      }
    }
    const bounds = new Box3().setFromObject(instance);
    const center = bounds.getCenter(new Vector3());
    const dimensions = bounds.getSize(new Vector3());
    const floatingPieces: FloatingPiece[] = [];

    if (index === 0) {
      instance.updateMatrixWorld(true);
      config.visible.forEach((name, pieceIndex) => {
        const object = instance.getObjectByName(name)!;
        const sphere = new Box3().setFromObject(object).getBoundingSphere(new Sphere());
        object.parent?.worldToLocal(sphere.center);
        const motion = IDEA_MOTION[pieceIndex];
        floatingPieces.push({
          object,
          rotationX: motion[2], rotationY: motion[3], rotationZ: motion[4],
          radius: sphere.radius,
          centerOffsetX: sphere.center.x - object.position.x,
          centerOffsetY: sphere.center.y - object.position.y,
        });
      });
    }

    return { instance, center, extent: Math.max(dimensions.x, dimensions.y), floatingPieces };
  }, [index, scene]);
  const floatingPiecesRef = useRef(floatingPieces);
  const ideaSimulation = useRef(createIdeaSimulation());

  useLayoutEffect(() => {
    const anchor = anchors.current[index];
    const surface = surfaceRef.current;
    if (!anchor || !surface || !root.current || !model.current) return;
    const update = () => {
      if (!root.current || !model.current) return;
      const frame = anchor.getBoundingClientRect();
      const surfaceBounds = surface.getBoundingClientRect();
      if (!frame.width || !frame.height) return;
      root.current.position.set(frame.left - surfaceBounds.left + frame.width / 2 - surfaceBounds.width / 2,
        surfaceBounds.height / 2 - (frame.top - surfaceBounds.top + frame.height / 2), 0);
      const scale = Math.min(frame.width, frame.height) * STAGES[index].scale / extent;
      model.current.scale.setScalar(scale);
      if (index === 0) {
        const padding = 5 / scale;
        const halfWidth = frame.width / (2 * scale);
        const halfHeight = frame.height / (2 * scale);
        for (const [pieceIndex, piece] of floatingPiecesRef.current.entries()) {
          const simulationIndex = pieceIndex * 6;
          ideaSimulation.current[simulationIndex + 2] = center.x - halfWidth + piece.radius - piece.centerOffsetX + padding;
          ideaSimulation.current[simulationIndex + 3] = center.x + halfWidth - piece.radius - piece.centerOffsetX - padding;
          ideaSimulation.current[simulationIndex + 4] = center.y - halfHeight + piece.radius - piece.centerOffsetY + padding;
          ideaSimulation.current[simulationIndex + 5] = center.y + halfHeight - piece.radius - piece.centerOffsetY - padding;
          piece.object.position.x = MathUtils.clamp(piece.object.position.x,
            ideaSimulation.current[simulationIndex + 2], ideaSimulation.current[simulationIndex + 3]);
          piece.object.position.y = MathUtils.clamp(piece.object.position.y,
            ideaSimulation.current[simulationIndex + 4], ideaSimulation.current[simulationIndex + 5]);
        }
        motionBoundsReady.current = true;
      }
      invalidate();
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(anchor);
    observer.observe(surface);
    return () => observer.disconnect();
  }, [anchors, center, extent, index, invalidate, size.width, size.height, surfaceRef]);

  useFrame(({ clock }, delta) => {
    if (!active || reducedMotion || !model.current) return;
    const time = clock.elapsedTime + index * 0.9;
    model.current.position.y = Math.sin(time * 0.65) * 2.2;
    model.current.rotation.x = (index === 3 ? SOLUTION_ROTATION_X : 0) + Math.sin(time * 0.38) * 0.025;
    model.current.rotation.y = (index === 3 ? SOLUTION_ROTATION_Y : 0) + Math.sin(time * 0.31) * 0.04;

    if (index === 0 && motionBoundsReady.current) {
      const frameDelta = Math.min(delta, 0.05);
      for (const [pieceIndex, piece] of floatingPiecesRef.current.entries()) {
        const simulationIndex = pieceIndex * 6;
        let nextX = piece.object.position.x + ideaSimulation.current[simulationIndex] * frameDelta;
        let nextY = piece.object.position.y + ideaSimulation.current[simulationIndex + 1] * frameDelta;
        const minX = ideaSimulation.current[simulationIndex + 2];
        const maxX = ideaSimulation.current[simulationIndex + 3];
        const minY = ideaSimulation.current[simulationIndex + 4];
        const maxY = ideaSimulation.current[simulationIndex + 5];
        if (nextX <= minX) {
          nextX = minX + (minX - nextX);
          ideaSimulation.current[simulationIndex] = Math.abs(ideaSimulation.current[simulationIndex]);
        } else if (nextX >= maxX) {
          nextX = maxX - (nextX - maxX);
          ideaSimulation.current[simulationIndex] = -Math.abs(ideaSimulation.current[simulationIndex]);
        }
        if (nextY <= minY) {
          nextY = minY + (minY - nextY);
          ideaSimulation.current[simulationIndex + 1] = Math.abs(ideaSimulation.current[simulationIndex + 1]);
        } else if (nextY >= maxY) {
          nextY = maxY - (nextY - maxY);
          ideaSimulation.current[simulationIndex + 1] = -Math.abs(ideaSimulation.current[simulationIndex + 1]);
        }
        piece.object.position.x = nextX;
        piece.object.position.y = nextY;
        piece.object.rotation.x += piece.rotationX * frameDelta;
        piece.object.rotation.y += piece.rotationY * frameDelta;
        piece.object.rotation.z += piece.rotationZ * frameDelta;
      }
    }
    invalidate();
  });

  return (
    <group ref={root}>
      <group ref={model} rotation={index === 3 ? [SOLUTION_ROTATION_X, SOLUTION_ROTATION_Y, 0] : undefined}>
        <primitive object={instance} position={[-center.x, -center.y, -center.z]} />
        {index === 3 && (
          <>
            <mesh position={[0, -0.58, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.48, 0.5, 48]} />
              <meshBasicMaterial color="#b6ff00" transparent opacity={0.2} depthWrite={false} />
            </mesh>
            <StageParticles />
          </>
        )}
      </group>
    </group>
  );
}

function StageScene({ anchors, active, reducedMotion, surfaceRef }: {
  anchors: RefObject<Array<HTMLDivElement | null>>;
  active: boolean;
  reducedMotion: boolean;
  surfaceRef: RefObject<HTMLDivElement | null>;
}) {
  return STAGES.map((_, index) => (
    <ProcessStage key={index} index={index} anchors={anchors}
      active={active} reducedMotion={reducedMotion} surfaceRef={surfaceRef} />
  ));
}

export function ConceptProcess3D({ anchors }: { anchors: RefObject<Array<HTMLDivElement | null>> }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={surfaceRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Canvas orthographic camera={{ position: [0, 0, 1000], zoom: 1, near: 0.1, far: 2000 }}
        dpr={[1, 1.5]} frameloop="demand" gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
        <ambientLight intensity={1.05} />
        <directionalLight position={[3, 4, 6]} intensity={2.2} />
        <directionalLight position={[-3, 1, 4]} intensity={0.65} />
        <StageScene anchors={anchors} active={active} reducedMotion={reducedMotion} surfaceRef={surfaceRef} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
