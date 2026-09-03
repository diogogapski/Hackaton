const processSteps = [
  { number: "01", title: "INSCRIÇÃO", text: "Entre no HackIF." },
  { number: "02", title: "EQUIPE", text: "Forme sua equipe." },
  { number: "03", title: "DESAFIO", text: "Escolha ou receba o problema a ser resolvido." },
  { number: "04", title: "DESENVOLVIMENTO", text: "Transforme ideias em uma solução." },
  { number: "05", title: "SUBMISSÃO", text: "Entregue o projeto." },
  { number: "06", title: "AVALIAÇÃO", text: "A solução passa pela avaliação dos jurados." },
  { number: "07", title: "RESULTADO", text: "As melhores soluções são reconhecidas." },
] as const;

export function ProcessSection() {
  return (
    <section className="border-y border-foreground/10 bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
          <span className="text-accent">04 //</span> PROCESSO
        </p>
        <h2 className="mt-7 font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
          <span className="block text-foreground">DO DESAFIO</span>
          <span className="block text-accent">À SOLUÇÃO._</span>
        </h2>

        <div className="mt-16 max-w-[980px]">
          {processSteps.map((step) => (
            <div key={step.number} className="grid gap-5 border-l border-accent/20 pb-12 pl-6 last:pb-0 md:grid-cols-[140px_1fr] md:gap-10 md:pl-10">
              <p className="font-display text-[2.2rem] font-semibold leading-none text-accent">{step.number}</p>
              <div className="border-t border-foreground/12 pt-5">
                <h3 className="font-display text-[1.15rem] font-semibold uppercase text-foreground">{step.title}</h3>
                <p className="mt-3 font-display text-[1rem] leading-6 text-foreground/58">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
