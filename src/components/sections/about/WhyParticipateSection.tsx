const reasons = [
  { title: "EXPERIÊNCIA", text: "Coloque seus conhecimentos em prática." },
  { title: "CONEXÃO", text: "Trabalhe com pessoas e perspectivas diferentes." },
  { title: "APRENDIZADO", text: "Desenvolva novas habilidades durante o processo." },
  { title: "IMPACTO", text: "Construa algo capaz de responder a um problema real." },
] as const;

export function WhyParticipateSection() {
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 md:px-10 lg:grid-cols-[0.38fr_0.62fr]">
        <div>
          <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
            <span className="text-accent">05 //</span> EXPERIÊNCIA
          </p>
          <h2 className="mt-7 font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
            <span className="block text-foreground">MAIS QUE</span>
            <span className="block text-accent">UMA COMPETIÇÃO._</span>
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          {reasons.map((reason, index) => (
            <div key={reason.title} className="border-t border-accent/20 pt-6">
              <p className="font-display text-[3rem] font-semibold leading-none text-foreground/18">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-8 font-display text-[1.2rem] font-semibold uppercase text-foreground">{reason.title}</h3>
              <p className="mt-4 font-display text-[1rem] leading-6 text-foreground/58">{reason.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
