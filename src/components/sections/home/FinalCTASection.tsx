import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { YourTurn3D } from "../../three/YourTurn3D";
export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden border-t border-foreground/10 bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-10 lg:grid-cols-[0.56fr_0.44fr] lg:items-center">
        <div>
          <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
            <span className="text-accent">08 //</span> SUA VEZ
          </p>
          <h2 className="mt-7 font-display text-[clamp(2.4rem,6vw,6.8rem)] font-semibold uppercase leading-[0.96] tracking-0">
            <span className="block text-foreground">TODA SOLUÇÃO</span>
            <span className="block text-foreground">COMEÇA COM UMA IDEIA.</span>
            <span className="mt-4 block text-accent">QUAL É A SUA?_</span>
          </h2>
          <p className="mt-8 max-w-[440px] font-display text-base leading-7 text-foreground/64 md:text-[1.05rem]">
            O próximo desafio pode começar com você.
          </p>
          <Link
            href="/cadastro"
            className="mt-10 inline-flex min-h-14 items-center gap-2 bg-accent px-8 font-display text-[0.9rem] !text-[#050706] font-semibold uppercase text-background transition-colors hover:bg-foreground"
          >
            PARTICIPAR DO HACKIF
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>

        <YourTurn3D />
      </div>
    </section>
  );
}
