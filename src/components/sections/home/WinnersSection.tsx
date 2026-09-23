import Link from "next/link";
import { ArrowUpRight, Medal, Trophy } from "lucide-react";
import type { VencedorHome } from "./types";

const secondaryPlaces = [
  { position: "02", title: "SEGUNDO LUGAR" },
  { position: "03", title: "TERCEIRO LUGAR" },
] as const;

export function WinnersSection({ winners }: { winners: VencedorHome[] }) {
  const firstPlace = winners[0];

  return (
    <section id="resultados" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.36fr_0.64fr] lg:items-start lg:gap-16">
          <div>
            <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
              <span className="text-accent">05 //</span> HALL OF SOLUTIONS
            </p>
            <h2 className="mt-7 font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
              <span className="block text-foreground">IDEIAS QUE SAÍRAM</span>
              <span className="block text-accent">DO PAPEL._</span>
            </h2>
            <p className="mt-8 max-w-[520px] font-display text-base leading-7 text-foreground/64 md:text-[1.05rem]">
              Conheça as equipes e soluções que se destacaram nos desafios do
              HackIF.
            </p>
          </div>

          <div className="relative overflow-hidden border border-foreground/12 bg-background p-6 md:p-10 lg:p-12">
            <div
              className="absolute inset-0 opacity-25"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(182,255,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(182,255,0,0.025) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
              }}
            />
            <span
              className="absolute right-8 top-4 font-display text-[clamp(7rem,15vw,13rem)] font-semibold leading-none text-accent/[0.035]"
              aria-hidden="true"
            >
              01
            </span>

            <div className="relative">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-display text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-foreground/45">
                    WINNERS_ARCHIVE
                  </p>
                  <p className="mt-2 font-display text-[0.72rem] uppercase tracking-[0.08em] text-accent/70">
                    STATUS // {firstPlace ? "RESULTADO PUBLICADO" : "AGUARDANDO RESULTADOS"}
                  </p>
                </div>
                <Trophy
                  size={54}
                  strokeWidth={1.15}
                  className="shrink-0 text-accent"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-16 max-w-[640px]">
                <p className="font-display text-[clamp(4.5rem,10vw,9rem)] font-semibold leading-none text-accent">
                  {String(firstPlace?.posicao ?? 1).padStart(2, "0")}
                </p>
                <p className="mt-4 font-display text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-foreground/62">
                  PRIMEIRO LUGAR
                </p>
                <h3 className="mt-4 font-display text-[clamp(2rem,4vw,4.7rem)] font-semibold uppercase leading-[1] text-foreground">
                  {firstPlace?.projeto ?? "AINDA ESTÁ VAZIO._"}
                </h3>
                <p className="mt-7 font-display text-[1rem] leading-7 text-foreground/58">
                  {firstPlace ? `${firstPlace.equipe}${firstPlace.desafio ? ` // ${firstPlace.desafio}` : ""}` : "Pode ser da sua equipe."}
                </p>
              </div>

              <div className="my-12 h-px bg-foreground/12" />

              <div className="grid gap-8 md:grid-cols-2">
                {secondaryPlaces.map((place, indice) => {
                  const vencedor = winners[indice + 1];
                  return (
                  <div key={place.position} className="border-t border-accent/20 pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-display text-[2.6rem] font-semibold leading-none text-foreground/28">
                        {String(vencedor?.posicao ?? Number(place.position)).padStart(2, "0")}
                      </p>
                      <Medal
                        size={28}
                        strokeWidth={1.35}
                        className="text-accent/70"
                        aria-hidden="true"
                      />
                    </div>
                    <h4 className="mt-7 font-display text-[1rem] font-semibold uppercase text-foreground">
                      {vencedor?.projeto ?? place.title}
                    </h4>
                    <p className="mt-3 font-display text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-foreground/45">
                      {vencedor ? vencedor.equipe : "STATUS // AGUARDANDO RESULTADOS"}
                    </p>
                  </div>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-end">
                <Link
                  href="/resultados"
                  className="inline-flex items-center gap-2 font-display text-[0.82rem] font-semibold uppercase text-accent transition-colors hover:text-foreground"
                >
                  VER RESULTADOS
                  <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
