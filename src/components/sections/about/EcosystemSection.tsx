const roles = [
  "PARTICIPANTES",
  "EQUIPES",
  "COMISSÃO ORGANIZADORA",
  "MENTORES",
  "JURADOS",
  "PROFESSORES",
] as const;

export function EcosystemSection() {
  return (
    <section className="relative overflow-hidden border-t border-foreground/10 bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-10 lg:grid-cols-[0.46fr_0.54fr] lg:items-center">
        <div>
          <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
            <span className="text-accent">06 //</span> ECOSSISTEMA
          </p>
          <h2 className="mt-7 font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
            <span className="block text-foreground">DIFERENTES PAPÉIS.</span>
            <span className="block text-accent">UM MESMO OBJETIVO._</span>
          </h2>
        </div>

        <div className="relative grid min-h-[420px] place-items-center border-y border-accent/14 py-12">
          <div
            className="absolute left-1/2 top-0 h-full w-px bg-accent/10"
            aria-hidden="true"
          />
          <div
            className="absolute left-0 top-1/2 h-px w-full bg-accent/10"
            aria-hidden="true"
          />
          <div className="relative grid w-full gap-5 sm:grid-cols-2">
            {roles.map((role) => (
              <p
                key={role}
                className="border-l border-accent/20 pl-4 font-display text-[0.95rem] font-semibold uppercase text-foreground"
              >
                {role}
              </p>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center border border-accent/45 bg-background font-display text-[0.86rem] font-semibold text-accent">
            HACKIF
          </div>
        </div>
      </div>
    </section>
  );
}
