"use client";

import { useImperativeHandle, useLayoutEffect, useMemo, useRef, type Ref, type RefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { Box3, Vector3, type Group, type Object3D } from "three";
import { HackIFLogoParticles } from "./HackIFLogoParticles";
import {
  applyConstructionProgress,
  applyScatterProgress,
  CONSTRUCTION_DURATION,
  createConstructionTracks,
  createOffscreenPlacement,
  createOffscreenScatterPlacement,
  createScatterTracks,
} from "./hackif-logo-animation";

const MODEL_URL = "/models/hackif-logo.glb";

export const HACKIF_LOGO_PIECES = [
  "IF_Bola",
  "IF_F_01",
  "IF_F_02",
  "IF_F_03",
  "IF_F_04",
  "IF_F_05",
  "IF_F_06",
  "IF_F_07",
  "IF_I_01",
  "IF_I_02",
  "IF_I_03",
] as const;

export type HackIFLogoPieceName = (typeof HACKIF_LOGO_PIECES)[number];
export type HackIFLogoParts = Record<HackIFLogoPieceName, Object3D>;
export type HackIFLogoBounds = { final: Box3; framingPoints: Vector3[] };

type HackIFLogoModelProps = Omit<ThreeElements["group"], "ref"> & {
  ref?: Ref<HackIFLogoParts>;
  animate?: boolean;
  reducedMotion?: boolean;
  scrollProgressRef?: RefObject<number>;
  onBounds?: (bounds: HackIFLogoBounds) => void;
  onConstructionStart?: () => void;
  onConstructionComplete?: () => void;
};

export function HackIFLogoModel({ ref, animate = false, reducedMotion = false, scrollProgressRef, onBounds, onConstructionStart, onConstructionComplete, ...props }: HackIFLogoModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);
  const canvasWidth = useThree((state) => state.size.width);
  const logoScale = 1.27 * Math.min(1, canvasWidth / 390);
  const progress = useRef(0);
  const startedAt = useRef<number | null>(null);
  const idleGroup = useRef<Group>(null);
  const idleTime = useRef(0);
  const scatterProgress = useRef(0);
  const { instance, pieces, offset, tracks, scatterTracks, bounds } = useMemo(() => {
    // Each instance keeps its own transforms without changing the cached GLB.
    const instance = scene.clone(true);
    const pieces = {} as HackIFLogoParts;

    for (const name of HACKIF_LOGO_PIECES) {
      const piece = instance.getObjectByName(name);
      if (!piece) throw new Error(`Missing GLB object: ${name}`);
      pieces[name] = piece;
    }

    const finalBounds = new Box3().setFromObject(instance);
    const center = finalBounds.getCenter(new Vector3());
    const offset: [number, number, number] = [-center.x, -center.y, -center.z];
    const tracks = createConstructionTracks(pieces);
    const scatterTracks = createScatterTracks(pieces);
    const framingPoints: Vector3[] = [];
    const sampleBounds = new Box3();

    // Frame the assembled logo only; distant starting poses may enter from offscreen.
    for (const { object } of tracks) {
      sampleBounds.setFromObject(object);
      for (const x of [sampleBounds.min.x, sampleBounds.max.x]) {
        for (const y of [sampleBounds.min.y, sampleBounds.max.y]) {
          for (const z of [sampleBounds.min.z, sampleBounds.max.z]) {
            framingPoints.push(new Vector3(x, y, z).sub(center));
          }
        }
      }
    }
    const translation = center.clone().negate();
    const bounds = {
      final: finalBounds.translate(translation),
      framingPoints,
    };

    return { instance, pieces, offset, tracks, scatterTracks, bounds };
  }, [scene]);
  const placeOffscreen = useMemo(() => createOffscreenPlacement(tracks), [tracks]);
  const placeScatterOffscreen = useMemo(() => createOffscreenScatterPlacement(scatterTracks), [scatterTracks]);

  // Expose the original named objects for future per-piece scroll animation.
  useImperativeHandle(ref, () => pieces, [pieces]);

  useLayoutEffect(() => {
    onBounds?.(bounds);
  }, [bounds, onBounds]);

  useLayoutEffect(() => {
    if (reducedMotion) {
      idleTime.current = 0;
      scatterProgress.current = 0;
      idleGroup.current?.position.set(0, 0, 0);
      idleGroup.current?.rotation.set(0, 0, 0);
      progress.current = 1;
      onConstructionComplete?.();
    } else {
      placeOffscreen(camera, progress.current);
    }
    applyConstructionProgress(tracks, progress.current);
    invalidate();
  }, [tracks, reducedMotion, animate, invalidate, onConstructionComplete, placeOffscreen, camera]);

  useFrame((_, delta) => {
    if (!reducedMotion && progress.current < 1) placeOffscreen(camera, progress.current);
    if (!animate || reducedMotion) return;
    if (progress.current >= 1) {
      placeScatterOffscreen(camera);
      const targetScatter = scrollProgressRef?.current ?? 0;
      const scatterDelta = Math.min(delta, 0.05);
      scatterProgress.current += (targetScatter - scatterProgress.current)
        * (1 - Math.exp(-8 * scatterDelta));
      if (Math.abs(targetScatter - scatterProgress.current) < 0.0001) {
        scatterProgress.current = targetScatter;
      }
      applyScatterProgress(scatterTracks, scatterProgress.current);

      idleTime.current += Math.min(delta, 0.05);
      const time = idleTime.current;
      const t = Math.min(time / 1.5, 1);
      const blend = t * t * t * (10 + t * (-15 + 6 * t));
      const scatterT = Math.min(Math.max((scatterProgress.current - 0.22) / 0.23, 0), 1);
      const idleWeight = 1 - scatterT * scatterT * (3 - 2 * scatterT);
      if (idleGroup.current) {
        idleGroup.current.position.y = Math.sin(time * Math.PI / 4) * 0.022 * blend * idleWeight;
        idleGroup.current.rotation.set(
          Math.sin(time * Math.PI / 6) * 0.035 * blend * idleWeight,
          Math.sin(time * Math.PI / 8) * 0.052 * blend * idleWeight,
          0,
        );
      }
      invalidate();
      return;
    }
    const now = performance.now();
    if (startedAt.current === null) {
      startedAt.current = now;
      onConstructionStart?.();
    }
    progress.current = Math.min((now - startedAt.current) / (CONSTRUCTION_DURATION * 1000), 1);
    applyConstructionProgress(tracks, progress.current);
    invalidate();
    if (progress.current === 1) onConstructionComplete?.();
  });

  return (
    <group {...props}>
      <group ref={idleGroup} scale={logoScale}>
        <group position={offset} dispose={null}>
          <primitive object={instance} />
        </group>
      </group>
      {!reducedMotion && <HackIFLogoParticles time={idleTime} scatterProgress={scatterProgress} baseY={bounds.final.min.y - 0.12} />}
    </group>
  );
}
