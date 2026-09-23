"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type ShaderMaterial } from "three";

const PARTICLE_COUNT = 30;
const vertexShader = `
  attribute vec3 motion;
  attribute vec3 variation;
  uniform float time;
  uniform float pixelRatio;
  uniform float scatterProgress;
  varying float opacity;
  void main() {
    float cycle = time / motion.y + motion.x;
    float age = fract(cycle);
    vec3 point = position;
    point.x += sin(floor(cycle) * 2.4 + motion.x * 31.0) * 0.06;
    point.x += sin(age * 6.28318 + motion.x * 6.28318) * variation.y;
    point.y += age * variation.x;
    point.z += sin(age * 3.14159 + motion.x * 6.28318) * 0.06;
    opacity = pow(sin(age * 3.14159), 1.4) * smoothstep(0.0, 1.5, time)
      * (1.0 - smoothstep(0.25, 1.0, scatterProgress))
      * variation.z * (0.85 + 0.15 * sin(time * 1.2 + motion.x * 6.28318));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
    gl_PointSize = motion.z * pixelRatio;
  }
`;
const fragmentShader = `
  uniform vec3 color;
  varying float opacity;
  void main() {
    float dotAlpha = 1.0 - smoothstep(0.12, 0.5, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(color, dotAlpha * opacity * 0.85);
    #include <colorspace_fragment>
  }
`;

export function HackIFLogoParticles({ time, scatterProgress, baseY }: {
  time: RefObject<number>;
  scatterProgress: RefObject<number>;
  baseY: number;
}) {
  const material = useRef<ShaderMaterial>(null);
  const { positions, motion, variation, uniforms } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const motion = new Float32Array(PARTICLE_COUNT * 3);
    const variation = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seed = (i * 0.61803398875) % 1;
      const nearBase = i < 10;
      const outer = i >= 22;
      const behind = i >= 10 && i < 19;
      const foreground = i >= 27;
      const side = i % 2 === 0 ? -1 : 1;
      positions.set([
        nearBase ? (seed - 0.5) * 1.65 : behind ? (seed - 0.5) * 1.5
          : side * (0.56 + seed * (outer ? 0.38 : 0.15)),
        nearBase ? seed * 0.06 : 0.12 + seed * 1.05,
        behind ? -0.3 - seed * 0.25 : foreground ? 0.2 + seed * 0.12
          : Math.sin(i * 2.4) * 0.16,
      ], i * 3);
      motion.set([seed, 5.5 + (i % 5) * 0.8, 2.2 + (i % 4) * 0.45], i * 3);
      variation.set([nearBase ? 0.32 + seed * 0.3 : 0.18 + seed * 0.2,
        0.025 + seed * 0.04, behind ? 0.35 + seed * 0.25 : 0.6 + seed * 0.4], i * 3);
    }
    return {
      positions, motion, variation,
      uniforms: {
        time: { value: 0 }, pixelRatio: { value: 1 }, scatterProgress: { value: 0 },
        color: { value: new Color("#b6ff00") },
      },
    };
  }, []);

  useFrame(({ gl }) => {
    if (!material.current) return;
    material.current.uniforms.time.value = time.current;
    material.current.uniforms.pixelRatio.value = gl.getPixelRatio();
    material.current.uniforms.scatterProgress.value = scatterProgress.current;
  });

  return (
    <points position-y={baseY} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-motion" args={[motion, 3]} />
        <bufferAttribute attach="attributes-variation" args={[variation, 3]} />
      </bufferGeometry>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader}
        fragmentShader={fragmentShader} transparent depthWrite={false} toneMapped={false} />
    </points>
  );
}
