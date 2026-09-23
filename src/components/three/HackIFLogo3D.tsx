"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type Ref, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useInView } from "framer-motion";
import { PerspectiveCamera, Quaternion, Vector3 } from "three";
import { HackIFLogoModel, type HackIFLogoBounds, type HackIFLogoParts } from "./HackIFLogoModel";

export const LOGO_SIZE_MULTIPLIER = 1.2;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => true;

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

type LogoCameraProps = {
  bounds: HackIFLogoBounds | null;
  anchor?: HTMLElement;
  initialViewport?: { width: number; height: number };
  surfaceRef: RefObject<HTMLDivElement | null>;
  layoutRefreshRef?: RefObject<(() => void) | null>;
};

function LogoCamera({ bounds, anchor, initialViewport, surfaceRef, layoutRefreshRef }: LogoCameraProps) {
  const { camera, size, invalidate } = useThree();
  const measuredFrame = useRef<{
    element: HTMLElement;
    layoutWidth: number;
    layoutHeight: number;
    width: number;
    height: number;
  } | null>(null);

  useLayoutEffect(() => {
    let active = true;
    const direction = new Vector3();
    const point = new Vector3();
    const dimensions = new Vector3();
    const inverseRotation = new Quaternion();

    function updateCamera() {
      if (!active) return;
      const element = anchor ?? surfaceRef.current;
      const surface = surfaceRef.current?.getBoundingClientRect();
      const frame = element?.getBoundingClientRect();
      if (!element || !surface || !frame || !frame.width || !frame.height) return;

      // Match the former Canvas measurement: resize with layout, not CSS entrance scale.
      const previous = measuredFrame.current;
      if (previous?.element !== element || previous.layoutWidth !== element.offsetWidth
        || previous.layoutHeight !== element.offsetHeight) {
        const viewport = previous?.element !== element && initialViewport ? initialViewport : frame;
        measuredFrame.current = {
          element, layoutWidth: element.offsetWidth, layoutHeight: element.offsetHeight,
          width: viewport.width, height: viewport.height,
        };
      }
      const viewport = measuredFrame.current;
      if (!bounds || !viewport || !(camera instanceof PerspectiveCamera)) return;

      direction.set(0.4, 0.2, 4).normalize();
      camera.position.copy(direction);
      camera.lookAt(0, 0, 0);
      inverseRotation.copy(camera.quaternion).invert();
      const aspect = viewport.width / viewport.height;
      const tanHalfFov = Math.tan(camera.fov * Math.PI / 360);
      bounds.final.getSize(dimensions);
      const previousDistance = 1.15 * Math.max(dimensions.x, dimensions.y, dimensions.z)
        / (2 * Math.atan(Math.PI * camera.fov / 360)) * Math.max(1, 1 / aspect);
      let distance = previousDistance / LOGO_SIZE_MULTIPLIER;

      // Fit only the assembled logo; its entrance can use the rest of the Hero.
      const padding = 0.94;
      for (const corner of bounds.framingPoints) {
        point.copy(corner).applyQuaternion(inverseRotation);
        distance = Math.max(distance,
          point.z + Math.abs(point.x) / (tanHalfFov * aspect * padding),
          point.z + Math.abs(point.y) / (tanHalfFov * padding));
      }

      camera.position.copy(direction.multiplyScalar(distance));
      // Extend the original anchor's frustum over the Hero without moving the model.
      camera.setViewOffset(viewport.width, viewport.height,
        surface.left - frame.left, surface.top - frame.top, surface.width, surface.height);
      camera.updateMatrixWorld();
      invalidate();
    }

    updateCamera();
    const observer = new ResizeObserver(updateCamera);
    if (anchor) observer.observe(anchor);
    if (surfaceRef.current) observer.observe(surfaceRef.current);
    document.fonts.ready.then(updateCamera);
    if (layoutRefreshRef) layoutRefreshRef.current = updateCamera;
    return () => {
      active = false;
      observer.disconnect();
      if (layoutRefreshRef) layoutRefreshRef.current = null;
    };
  }, [bounds, camera, size.width, size.height, invalidate, anchor, initialViewport, surfaceRef, layoutRefreshRef]);

  return null;
}

type HackIFLogo3DProps = {
  className?: string;
  ref?: Ref<HackIFLogoParts>;
  anchor?: HTMLElement;
  initialViewport?: { width: number; height: number };
  layoutRefreshRef?: RefObject<(() => void) | null>;
  scrollProgressRef?: RefObject<number>;
  onConstructionStart?: () => void;
  onConstructionComplete?: () => void;
};

export function HackIFLogo3D({ className, ref, anchor, initialViewport, layoutRefreshRef, scrollProgressRef, onConstructionStart, onConstructionComplete }: HackIFLogo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useMemo(() => ({ current: anchor ?? null }), [anchor]);
  const visible = useInView(anchor ? anchorRef : containerRef, { once: true, amount: 0.2 });
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const [bounds, setBounds] = useState<HackIFLogoBounds | null>(null);

  return (
    <div ref={containerRef} className={`pointer-events-none h-full w-full ${className ?? ""}`}>
      <Canvas
        camera={{ position: [0.4, 0.2, 4], fov: 35, near: 0.01, far: 100 }}
        dpr={[1, 2]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ background: "transparent", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={2.5} />
        <directionalLight position={[-3, 1, 2]} intensity={1} />
        <LogoCamera bounds={bounds} anchor={anchor} initialViewport={initialViewport} surfaceRef={containerRef} layoutRefreshRef={layoutRefreshRef} />
        <Suspense fallback={null}>
          <HackIFLogoModel ref={ref} animate={visible} reducedMotion={reducedMotion} scrollProgressRef={scrollProgressRef} onBounds={setBounds}
            onConstructionStart={onConstructionStart} onConstructionComplete={onConstructionComplete} />
        </Suspense>
      </Canvas>
    </div>
  );
}
