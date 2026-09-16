import { Code2, Send, UserPlus, Users } from "lucide-react";

const howItWorksSteps = [
  { number: "01", title: "ENTRE NO HACKIF", description: "Faça sua inscrição.", icon: UserPlus },
  { number: "02", title: "FORME SUA EQUIPE", description: "Encontre as pessoas certas.", icon: Users },
  { number: "03", title: "RESOLVA O DESAFIO", description: "Transforme o problema em uma solução.", icon: Code2 },
  { number: "04", title: "ENTREGUE SUA SOLUÇÃO", description: "Submeta seu projeto.", icon: Send },
] as const;

export function HowItWorksSection() {
  return (
    <section id="participar" className="border-y border-foreground/10 bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
          <span className="text-accent">06 //</span> COMO FUNCIONA
        </p>
        <h2 className="mt-7 font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
          <span className="block text-foreground">DA IDEIA</span>
          <span className="block text-accent">À ENTREGA._</span>
        </h2>

        <div className="mt-18 grid gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-start lg:gap-5">
          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="contents">
                <article className="relative min-h-[180px] border-t border-accent/24 pt-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-display text-[0.9rem] font-semibold text-accent">{step.number}</span>
                    <Icon size={24} strokeWidth={1.5} className="text-foreground/45" aria-hidden="true" />
                  </div>
                  <h3 className="mt-8 font-display text-[1.15rem] font-semibold uppercase leading-tight text-foreground">{step.title}</h3>
                  <p className="mt-4 max-w-[280px] font-display text-[0.95rem] leading-6 text-foreground/58">{step.description}</p>
                </article>
                {index < howItWorksSteps.length - 1 ? (
                  <div className="hidden h-[180px] items-center justify-center font-display text-2xl text-accent/55 lg:flex" aria-hidden="true">→</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
