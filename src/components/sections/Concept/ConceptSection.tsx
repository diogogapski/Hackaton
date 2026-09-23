"use client";

import { ArrowDown, ChevronRight, Code2, Lightbulb, Rocket } from "lucide-react";
import { useRef } from "react";
import { ConceptProcess3D } from "../../three/ConceptProcess3D";

const processSteps = [
  {
    title: "IDEIA",
    description: ["Tudo come\u00e7a", "com uma ideia."],
    imageTodo: "/images/process/idea.webp",
  },
  {
    title: "CONEX\u00c3O",
    description: ["Pessoas certas", "geram impacto."],
    imageTodo: "/images/process/connection.webp",
  },
  {
    title: "ESTRUTURA",
    description: ["Organiza\u00e7\u00e3o transforma", "ideias em projetos."],
    imageTodo: "/images/process/structure.webp",
  },
  {
    title: "SOLU\u00c7\u00c3O REAL",
    description: ["Tecnologia que melhora", "a vida das pessoas."],
    imageTodo: "/images/process/solution.webp",
  },
] as const;

const pillars = [
  { icon: Lightbulb, title: "CRIE", description: "Tire ideias do papel" },
  {
    icon: Code2,
    title: "DESENVOLVA",
    description: "Transforme em solu\u00e7\u00f5es",
  },
  { icon: Rocket, title: "IMPACTE", description: "Gere valor real" },
] as const;

function ConceptProcess() {
  const stageAnchors = useRef<Array<HTMLDivElement | null>>([]);

  return (
    <div
      className="relative min-w-0 py-10 lg:pr-10"
    >
      <ConceptProcess3D anchors={stageAnchors} />
      <div className="mb-6 font-display text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
        <span className="text-accent">{"// "}</span>
        <span className="text-foreground/55">DA IDEIA À SOLUÇÃO REAL</span>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-start lg:gap-3">
        {processSteps.map((step, index) => (
          <div key={step.title} className="contents">
            <div
              className="min-w-0"
            >
              <div
                ref={(element) => { stageAnchors.current[index] = element; }}
                className="relative mb-4 h-[118px] w-full max-w-[138px]"
              />
              <h3 className="font-display text-[0.82rem] font-semibold uppercase leading-[1.15] text-accent">
                {step.title}
              </h3>
              <p className="mt-2 font-display text-[0.72rem] leading-5 text-foreground/52">
                {step.description.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>

            {index < processSteps.length - 1 ? (
              <div
                className="hidden h-[118px] items-center justify-center text-foreground/38 lg:flex"
                aria-hidden="true"
              >
                <ChevronRight size={22} strokeWidth={1.5} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutHackif() {
  return (
    <div
      className="min-w-0 border-t border-foreground/10 py-10 lg:border-l lg:border-t-0 lg:pl-10"
    >
      <div className="mb-4 font-display text-[0.72rem] font-semibold uppercase tracking-[0.08em]">
        <span className="text-accent">02 {"// "}</span>
        <span className="text-foreground/55">SOBRE O HACKIF</span>
      </div>

      <h2 className="font-display text-[clamp(1.8rem,2.5vw,2.8rem)] font-semibold leading-[0.98] tracking-[0.01em]">
        <span className="block text-foreground">Mais que um evento.</span>
        <span className="block text-accent">Um laboratório de ideias._</span>
      </h2>

      <div className="mt-5 max-w-[620px] space-y-2 font-display text-[0.86rem] leading-6 text-foreground/58">
        <p>
          O HackIF é o ponto de encontro entre criatividade, tecnologia e
          colaboração.
        </p>
        <p>
          Durante 24 a 48 horas, equipes multidisciplinares desenvolvem
          soluções para desafios reais, aprendem, conectam-se e
          constroem o futuro.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;

          return (
            <div key={pillar.title} className="flex items-start gap-3">
              <Icon
                size={28}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-[0.86rem] font-semibold uppercase leading-none text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 font-display text-[0.72rem] leading-5 text-foreground/52">
                  {pillar.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConceptSection() {
  return (
    <section id="sobre" className="bg-background" aria-labelledby="concept-title">
      <div className="mx-auto max-w-[1440px] border-t border-foreground/10 px-6 md:px-10">
        <div className="relative grid lg:grid-cols-2">
          <ConceptProcess />
          <AboutHackif />

          <div
            className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-accent/80 lg:block"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="flex h-6 w-3 items-center justify-center rounded-full border border-accent/70">
                <span className="h-1 w-1 rounded-full bg-accent" />
              </span>
              <ArrowDown size={14} strokeWidth={1.6} />
            </div>
          </div>
        </div>
      </div>
      <span id="concept-title" className="sr-only">
        Da ideia \u00e0 solu\u00e7\u00e3o real e sobre o HACKIF
      </span>
    </section>
  );
}
