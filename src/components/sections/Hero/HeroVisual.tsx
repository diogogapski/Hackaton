"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HeroPlatform, type PlatformPhase } from "./HeroPlatform";

const HackIFLogo3D = dynamic(
  () => import("../../three/HackIFLogo3D").then((module) => module.HackIFLogo3D),
  { ssr: false },
);

export function HeroVisual() {
  const [frame, setFrame] = useState<{ element: HTMLDivElement; width: number; height: number } | null>(null);
  const registerAnchor = useCallback((element: HTMLDivElement | null) => {
    if (!element) return setFrame(null);
    const { width, height } = element.getBoundingClientRect();
    setFrame({ element, width, height });
  }, []);
  const [phase, setPhase] = useState<PlatformPhase>("idle");
  const visualRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const layoutRefreshRef = useRef<(() => void) | null>(null);
  const startConstruction = useCallback(() => setPhase("constructing"), []);
  const finishConstruction = useCallback(() => setPhase("complete"), []);
  const anchor = frame?.element;
  const hero = anchor?.closest("section");

  useEffect(() => {
    if (!anchor || !hero) return;
    let animationFrame = 0;

    const updateScrollProgress = () => {
      animationFrame = 0;
      const heroBounds = hero.getBoundingClientRect();
      const anchorBounds = anchor.getBoundingClientRect();
      const anchorCenterInHero = anchorBounds.top - heroBounds.top + anchorBounds.height / 2;
      const anchorCenterInViewport = heroBounds.top + anchorCenterInHero;
      const travel = Math.max(window.innerHeight * 0.6, 1);
      const rawProgress = Math.min(Math.max((window.innerHeight * 0.4 - anchorCenterInViewport) / travel, 0), 1);
      const progress = phase === "complete" ? rawProgress : 0;
      scrollProgressRef.current = progress;
      visualRef.current?.style.setProperty("--hero-scatter-progress", String(progress));

      const canvas = hero.querySelector<HTMLElement>("[data-hero-canvas]");
      if (canvas) {
        canvas.style.opacity = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? String(1 - progress)
          : "1";
      }
    };
    const requestUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [anchor, hero, phase]);

  return (
    <motion.div
      ref={visualRef}
      className="relative z-0 mx-auto flex h-[320px] w-full max-w-[620px] items-center justify-center md:h-[380px] lg:-mx-10 lg:h-[430px]"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.18, ease: "easeOut" }}
      onUpdate={() => layoutRefreshRef.current?.()}
      role="img"
      aria-label="Símbolo do IF em 3D"
    >
      <HeroPlatform phase={phase} />
      <div ref={registerAnchor} data-logo-anchor className="relative h-[70%] w-[76%]" />
      {hero && anchor && createPortal(
        <div data-hero-canvas className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
          <HackIFLogo3D
            anchor={anchor}
            initialViewport={frame ?? undefined}
            layoutRefreshRef={layoutRefreshRef}
            scrollProgressRef={scrollProgressRef}
            onConstructionStart={startConstruction}
            onConstructionComplete={finishConstruction}
          />
        </div>,
        hero,
      )}
    </motion.div>
  );
}
