import type { DadosHome } from "@/src/server/home/dados";

export function FinalCTASection({ dados }: { dados: DadosHome }) {
  const cta = dados?.inscricoesAbertas
    ? { href: "/cadastro", label: "PARTICIPAR DO HACKIF ↗" }
    : { href: "/hackathon", label: "CONHECER A EDIÇÃO ↗" };

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
          <a
            href={cta.href}
            className="mt-10 inline-flex min-h-14 items-center bg-accent px-8 font-display text-[0.9rem] !text-[#050706] font-semibold uppercase text-background transition-colors hover:bg-foreground"
          >
            {cta.label}
          </a>
        </div>

        <div className="relative min-h-[360px] border-l border-t border-accent/16 bg-foreground/[0.012] lg:min-h-[520px]">
          {/* TODO: inserir IF 3D final */}
          <div
            className="absolute inset-0 opacity-40"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 45%, rgba(182,255,0,0.12), transparent 36%), linear-gradient(rgba(182,255,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(182,255,0,0.025) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 64px 64px, 64px 64px",
            }}
          />
          <div className="absolute bottom-6 left-6 font-display text-[0.72rem] uppercase tracking-[0.08em] text-foreground/35">
            FINAL_SYMBOL // RESERVED_SPACE
          </div>
        </div>
      </div>
    </section>
  );
}
