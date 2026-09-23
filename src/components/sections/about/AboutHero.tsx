export function AboutHero() {
  const metrics = [
    { value: "24-48H", label: "DURAÇÃO" },
    { value: "03-05", label: "INTEGRANTES / EQUIPE" },
    { value: "15-25", label: "EQUIPES" },
  ] as const;

  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-24">
      <div
        className="absolute inset-0 opacity-50"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(182,255,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(182,255,0,0.025) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
        }}
      />

      <div className="relative mx-auto grid max-w-[1440px] gap-14 px-6 md:px-10 lg:grid-cols-[0.53fr_0.47fr] lg:items-center">
        <div>
          <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
            <span className="text-accent">01 //</span> SOBRE O HACKIF
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.8rem,5.4vw,5.9rem)] font-semibold uppercase leading-[0.98]">
            UM DESAFIO.
            <span className="block">MUITAS IDEIAS.</span>
            <span className="block text-accent">SOLUÇÕES REAIS._</span>
          </h1>
          <p className="mt-8 max-w-[620px] font-display text-sm leading-6 text-foreground/64 md:text-base md:leading-7">
            O HackIF é o Hackathon de Ciência da Computação do IFPR Campus
            Pinhais: um espaço onde estudantes transformam problemas reais em
            soluções por meio da tecnologia.
            <br />
            <br />
            Durante o evento, equipes trabalham juntas para investigar um
            desafio, desenvolver uma proposta e transformar uma ideia em algo
            que possa ser apresentado, testado e discutido.
          </p>
        </div>

        <div className="relative border border-accent/22 bg-background/92">
          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-accent/70" aria-hidden="true" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-accent/70" aria-hidden="true" />

          <div className="flex items-center justify-between border-b border-accent/18 px-6 py-5 md:px-8">
            <p className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-accent">
              HACKIF // EVENT_BRIEF
            </p>
            <p className="font-mono text-[0.65rem] uppercase text-foreground/35">SYS.01 / ACTIVE</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="border-b border-accent/14 px-6 py-7 sm:border-r sm:last:border-r-0 md:px-8">
                <p className="font-display text-[clamp(2rem,3.4vw,3.5rem)] font-semibold leading-none text-accent">
                  {metric.value}
                </p>
                <p className="mt-3 font-mono text-[0.66rem] font-semibold uppercase leading-5 tracking-[0.08em] text-foreground/48">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2">
            <div className="border-b border-accent/14 px-6 py-7 sm:border-b-0 sm:border-r md:px-8">
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-foreground/40">INSTITUIÇÃO</p>
              <p className="mt-4 font-display text-xl font-semibold uppercase text-foreground">IFPR</p>
              <p className="mt-1 font-display text-sm uppercase text-foreground/58">CAMPUS PINHAIS</p>
            </div>
            <div className="px-6 py-7 md:px-8">
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-foreground/40">STATUS</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="h-2 w-2 bg-accent shadow-[0_0_12px_rgba(182,255,0,0.55)]" aria-hidden="true" />
                <p className="font-display text-sm font-semibold uppercase text-accent">EM PREPARAÇÃO</p>
              </div>
              <p className="mt-4 font-mono text-[0.62rem] uppercase text-foreground/32">DATA A DEFINIR</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
