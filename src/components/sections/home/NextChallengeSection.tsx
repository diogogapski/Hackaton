import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DesafioHome } from "./types";

export function NextChallengeSection({ desafio }: { desafio: DesafioHome | null }) {
  return (
    <section id="desafios" className="relative overflow-hidden border-t border-foreground/10 bg-background py-24 lg:py-32">
      <div className="absolute inset-0 opacity-35" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(182,255,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(182,255,0,0.025) 1px, transparent 1px)", backgroundSize: "84px 84px" }} />
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10">
        <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55"><span className="text-accent">03 //</span> PRÓXIMO DESAFIO</p>
        <div className="mt-7 grid gap-8 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
          <h2 className="font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
            <span className="block text-foreground">O PRÓXIMO PROBLEMA</span>
            <span className="block text-accent">AINDA ESTÁ POR VIR._</span>
          </h2>
          <p className="max-w-[520px] font-display text-base leading-7 text-foreground/64 md:text-[1.05rem] lg:justify-self-end">Novos desafios serão publicados aqui. Prepare sua equipe. A próxima ideia pode começar com vocês.</p>
        </div>
        <div className="relative mt-16 min-h-[420px] border border-foreground/12 bg-background/92 p-6 md:p-10 lg:p-12">
          <span className="absolute left-0 top-0 h-8 w-8 border-l border-t border-accent/45" aria-hidden="true" />
          <span className="absolute right-0 top-0 h-8 w-8 border-r border-t border-accent/25" aria-hidden="true" />
          <span className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-accent/25" aria-hidden="true" />
          <span className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-accent/45" aria-hidden="true" />
          <div className="flex h-full min-h-[340px] flex-col">
            <div className="flex items-start justify-between gap-6">
              <p className="font-display text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">NEXT_CHALLENGE</p>
              <p className="font-display text-[0.72rem] uppercase text-foreground/35">{desafio?.categoria ?? "EDIÇÃO ATUAL"}</p>
            </div>
            <div className="mt-12">
              <p className="font-display text-[0.72rem] uppercase tracking-[0.08em] text-foreground/45">STATUS</p>
              <div className="mt-3 flex items-center gap-3 font-display text-[1rem] font-semibold uppercase text-accent"><span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />{desafio ? "PUBLICADO" : "EM BREVE"}</div>
            </div>
            <div className="grid flex-1 content-center py-10">
              {desafio ? (
                <div className="max-w-3xl">
                  <h3 className="font-display text-[clamp(2rem,5vw,4.5rem)] font-semibold uppercase leading-none text-foreground">{desafio.titulo}</h3>
                  <p className="mt-6 max-w-2xl text-[1rem] leading-7 text-foreground/62">{desafio.descricao}</p>
                </div>
              ) : <span className="text-center font-display text-[clamp(5rem,12vw,10rem)] font-semibold leading-none text-foreground/10">?</span>}
            </div>
            <div className="mt-auto flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-[460px] font-display text-[1rem] leading-7 text-foreground/62">{desafio?.responsavel ? `Proposto por ${desafio.responsavel}.` : desafio ? "Confira os detalhes e prepare sua solução." : "O próximo desafio está sendo preparado."}</p>
              <Link href="/desafios" className="inline-flex items-center gap-2 font-display text-[0.82rem] font-semibold uppercase text-accent transition-colors hover:text-foreground">
                VER DESAFIOS
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
