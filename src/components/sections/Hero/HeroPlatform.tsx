"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import styles from "./HeroPlatform.module.css";

export type PlatformPhase = "idle" | "constructing" | "complete";

const columns = [
  { x: 78, top: 168, bottom: 392 },
  { x: 115, top: 92, bottom: 369 },
  { x: 244, top: 35, bottom: 413 },
  { x: 486, top: 126, bottom: 392 },
  { x: 526, top: 65, bottom: 367 },
  { x: 554, top: 228, bottom: 404 },
];

export function HeroPlatform({ phase }: { phase: PlatformPhase }) {
  const glowId = useId();
  const projectionId = useId();
  const scannerId = useId();
  const fieldRef = useRef<HTMLDivElement>(null);
  const [gridNodes, setGridNodes] = useState<{ x: number; y: number }[]>([]);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    const hero = field?.closest("section");
    if (!field || !hero) return;

    function alignGrid() {
      if (!field || !hero) return;
      const area = field.getBoundingClientRect();
      const background = hero.getBoundingClientRect();
      if (!area.width || !area.height) return;
      // Match the existing centered 72px Hero grid without painting a second grid.
      const originX = background.left + (background.width - 72) / 2;
      const originY = background.top + (background.height - 72) / 2;
      const nodes: { x: number; y: number }[] = [];
      for (let px = originX + Math.ceil((area.left - originX) / 72) * 72; px < area.right; px += 72) {
        for (let py = originY + Math.ceil((area.top - originY) / 72) * 72; py < area.bottom; py += 72) {
          const x = (px - area.left) / area.width * 600;
          const y = (py - area.top) / area.height * 460;
          if (x > 35 && x < 565 && y > 30 && y < 425
            && (x < 130 || x > 480 || y > 350)) nodes.push({ x, y });
        }
      }
      setGridNodes(nodes.filter((_, i) => i % 2 === 0).slice(0, 18));
    }

    alignGrid();
    const observer = new ResizeObserver(alignGrid);
    observer.observe(field);
    observer.observe(hero);
    return () => observer.disconnect();
  }, [phase]);

  return (
    <div ref={fieldRef} className={styles.platform} data-phase={phase} aria-hidden="true">
      <svg viewBox="0 0 600 460" preserveAspectRatio="none" fill="none" className={styles.diagram}>
        <defs>
          <radialGradient id={glowId}>
            <stop stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="0.3" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={projectionId} x1="0" y1="25" x2="0" y2="410" gradientUnits="userSpaceOnUse">
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.45" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="0.95" stopColor="currentColor" stopOpacity="0.46" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={scannerId} x1="122" y1="0" x2="478" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g stroke="currentColor" strokeWidth="0.65">
          <ellipse cx="300" cy="382" rx="280" ry="60" opacity="0.26" strokeDasharray="250 38 140 60" />
          <ellipse cx="300" cy="382" rx="228" ry="43" opacity="0.17" strokeDasharray="160 32 65 90" />
          <ellipse cx="300" cy="382" rx="171" ry="29" opacity="0.12" strokeDasharray="92 55" />
          <path d="M42 408H176L199 382H278 M342 365H418L452 392H556 M300 352V438" opacity="0.14" />
        </g>
        <g transform="translate(300 382) scale(1 .2143)">
          <circle className={styles.ring} r="280" stroke="currentColor" strokeWidth="0.8"
            strokeDasharray="80 820 32 828" opacity="0.32" />
        </g>

        <g className={styles.columns} stroke={`url(#${projectionId})`} strokeWidth="0.7">
          {columns.map(({ x, top, bottom }) => <path key={x} d={`M${x} ${top}V${bottom}`} />)}
        </g>
        {[columns[0], columns[4]].map(({ x, bottom }, i) => (
          <g key={x} transform={`translate(${x} ${bottom})`}>
            <g className={styles.dataPoint} style={{ animationDelay: `${i * -3.6}s` }}>
              <circle r="7" fill={`url(#${glowId})`} />
              <path d="M0 -4V4" stroke="currentColor" strokeWidth="1" />
            </g>
          </g>
        ))}

        {gridNodes.map(({ x, y }, i) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} opacity={i % 3 === 0 ? 0.48 : 0.22}>
            {i % 3 === 0 && <circle r="8" fill={`url(#${glowId})`} />}
            <path d="M-3 0H3 M0 -3V3" stroke="currentColor" strokeWidth="0.65" />
            {i % 4 === 0 && <path d="M0 -20V0H25" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />}
          </g>
        ))}

        <g className={styles.nodes} fill="currentColor">
          <circle cx="78" cy="392" r="1.5" />
          <circle cx="244" cy="413" r="1.4" />
          <circle cx="486" cy="392" r="1.5" />
          <circle cx="526" cy="367" r="1.2" />
          <circle cx="152" cy="433" r="1.1" />
        </g>
        <g className={styles.core}>
          <ellipse cx="300" cy="382" rx="22" ry="7" fill={`url(#${glowId})`} />
          <path d="M297 382H303 M300 379V385" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        </g>

        <g stroke="currentColor" strokeWidth="0.7">
          <g transform="translate(86 240)">
            <g className={styles.wireframe}>
              <path d="M0 -12L11 -8V8L0 12L-11 8V-8Z M-11 -8L0 -4L11 -8 M0 -4V12 M0 -12V-4" />
            </g>
          </g>
          <g transform="translate(526 198) scale(.72)">
            <g className={styles.wireframe} style={{ animationDelay: "-5s", opacity: 0.28 }}>
              <path d="M0 -12L11 -8V8L0 12L-11 8V-8Z M-11 -8L0 -4L11 -8 M0 -4V12 M0 -12V-4" />
            </g>
          </g>
          <rect x="177" y="43" width="7" height="7" opacity="0.24" />
        </g>

        <g className={styles.scanner} stroke={`url(#${scannerId})`}>
          <path d="M122 395H478" strokeWidth="0.8" />
          <path d="M122 395H478" strokeWidth="3" opacity="0.08" />
        </g>
      </svg>
    </div>
  );
}
