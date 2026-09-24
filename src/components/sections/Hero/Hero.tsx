import { HeroContent } from "./HeroContent";
import { HeroStats } from "./HeroStats";
import { HeroSystemInfo } from "./HeroSystemInfo";
import { HeroVisual } from "./HeroVisual";
import type { EdicaoHome } from "../home/types";

export function Hero({ edicao }: { edicao: EdicaoHome | null }) {
  return (
    <section
      className="relative isolate overflow-hidden bg-background"
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0 opacity-80"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 55% 38%, rgba(182,255,0,0.09), transparent 34%), linear-gradient(rgba(182,255,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(182,255,0,0.035) 1px, transparent 1px), radial-gradient(circle, rgba(244,247,242,0.09) 1px, transparent 1.2px)",
          backgroundSize: "100% 100%, 72px 72px, 72px 72px, 36px 36px",
          backgroundPosition: "center, center, center, 0 0",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-accent/10"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 pb-8 pt-8 md:px-10 lg:pb-10 lg:pt-12">
        <div className="grid gap-10 pb-8 lg:min-h-[430px] lg:grid-cols-[minmax(520px,0.48fr)_minmax(320px,0.34fr)_minmax(170px,0.18fr)] lg:gap-0">
          <HeroContent edicao={edicao} />
          <HeroVisual />
          <HeroSystemInfo edicao={edicao} />
        </div>

        <HeroStats edicao={edicao} />
      </div>
    </section>
  );
}
