export function AboutHero() {
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

      <div className="relative mx-auto grid max-w-[1440px] gap-12 px-6 md:px-10 lg:grid-cols-[0.44fr_0.28fr_0.28fr] lg:items-center">
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

        <div className="relative min-h-[300px] border border-accent/16 bg-foreground/[0.012] md:min-h-[360px]">
          <div className="absolute inset-6 border border-accent/12" />
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/25" />
          <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={index}
                className="h-12 w-12 border border-accent/65 bg-accent/[0.06] shadow-[0_0_26px_rgba(182,255,0,0.25)]"
              />
            ))}
          </div>
          <span className="absolute right-12 top-12 h-12 w-12 rounded-full bg-if-red shadow-[0_0_30px_rgba(215,25,32,0.55)]" />
        </div>

        <div className="relative min-h-[300px] border-l border-t border-accent/18 bg-foreground/[0.012] p-8 md:min-h-[360px]">
          <p className="text-right font-display text-[0.7rem] text-foreground/35">
            X 025.428 / Y 076.901
          </p>
          <div className="mt-14 grid gap-4 border-b border-accent/25 pb-7 font-display text-sm uppercase text-foreground/65">
            <span className="text-accent">HACKIF_2026</span>
            <span>1º HACKATHON</span>
            <span>CIÊNCIA DA COMPUTAÇÃO</span>
            <span>IFPR // CAMPUS PINHAIS</span>
          </div>
          <div className="mt-8 font-display text-sm font-semibold uppercase leading-6 text-accent">
            STATUS //
            <span className="block">EM PREPARAÇÃO</span>
          </div>
        </div>
      </div>
    </section>
  );
}
