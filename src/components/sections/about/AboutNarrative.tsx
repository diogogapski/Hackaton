"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  Braces,
  Clock3,
  GraduationCap,
  Lightbulb,
  MonitorUp,
  Network,
  Search,
  Trophy,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import styles from "./AboutNarrative.module.css";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const questions = [
  { number: "01", action: "QUESTIONAR", text: "Como transformar conhecimento em experiência?" },
  { number: "02", action: "INVESTIGAR", text: "Como aprender resolvendo problemas reais?" },
  { number: "03", action: "TRANSFORMAR", text: "Como transformar uma ideia em algo real?" },
] as const;

const steps: Array<[string, string, string, Icon]> = [
  ["01", "INSCREVA-SE", "Entre no HackIF e forme sua equipe.", User],
  ["02", "CONHEÇA O DESAFIO", "Entenda o problema que deverá ser enfrentado.", Braces],
  ["03", "IMERSÃO", "Pesquise, questione e encontre oportunidades.", Search],
  ["04", "CONSTRUA", "Transforme a ideia em uma solução.", Network],
  ["05", "APRESENTE", "Mostre o projeto, as decisões e o impacto proposto.", MonitorUp],
  ["06", "RESULTADO", "As soluções são avaliadas e os destaques reconhecidos.", Trophy],
];

const roles: Array<[string, string, Icon, string]> = [
  ["PARTICIPANTES", "Transformam conhecimento em soluções.", Users, "md:left-1/2 md:top-0 md:-translate-x-1/2"],
  ["MENTORES", "Orientam decisões durante o processo.", User, "md:left-0 md:top-[34%]"],
  ["PROFESSORES", "Apoiam o desenvolvimento técnico e acadêmico.", GraduationCap, "md:bottom-0 md:left-[8%]"],
  ["JURADOS", "Avaliam as soluções e seus impactos.", Users, "md:right-0 md:top-[34%]"],
  ["ORGANIZAÇÃO", "Estrutura o evento e conecta todas as etapas.", Network, "md:bottom-0 md:right-[8%]"],
];

const words = ["COLABORAÇÃO", "APRENDIZADO", "TECNOLOGIA", "CRIATIVIDADE", "EXPERIÊNCIA"] as const;

const formula: Array<[string, Icon]> = [
  ["PROBLEMA", Search],
  ["IDEIA", Lightbulb],
  ["EQUIPE", Users],
  ["TEMPO", Clock3],
];

function useEntered<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || entered) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [entered]);

  return [ref, entered] as const;
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
      <span className="text-accent">{`${index} //`}</span> {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 font-display text-[clamp(2.15rem,4.2vw,4.7rem)] font-semibold uppercase leading-[1.04]">
      {children}
    </h2>
  );
}

export function AboutNarrative() {
  const [processRef, processEntered] = useEntered<HTMLElement>();
  const [resultRef, resultEntered] = useEntered<HTMLElement>();

  return (
    <>
      <section className="relative overflow-hidden border-t border-accent/15 py-16 md:py-20 lg:py-28">
        <span className="pointer-events-none absolute -right-[0.04em] top-1/2 -translate-y-1/2 font-display text-[clamp(18rem,42vw,42rem)] font-semibold leading-none text-accent/[0.025]" aria-hidden="true">
          ?
        </span>
        <div className="relative mx-auto max-w-[1440px] px-6 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.34fr_0.66fr] lg:items-end">
            <div>
              <SectionLabel index="02">POR QUE EXISTE</SectionLabel>
              <SectionTitle>
                TUDO COMEÇA
                <span className="block">COM</span>
                <span className="block text-accent">PERGUNTAS._</span>
              </SectionTitle>
            </div>
            <p className="max-w-[620px] font-display text-sm leading-7 text-foreground/48 lg:justify-self-end">
              Antes de construir uma resposta, é preciso formular melhor o problema.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
            {questions.map((question, index) => (
              <div key={question.number} className="contents">
                <article className="relative border-t border-accent/28 py-6 lg:min-h-[220px] lg:pr-5">
                  <p className="font-mono text-[0.68rem] font-semibold tracking-[0.1em] text-accent">
                    {`${question.number} // ${question.action}`}
                  </p>
                  <p className="mt-8 max-w-[330px] font-display text-[clamp(1.25rem,2vw,2rem)] font-semibold uppercase leading-[1.18] text-foreground">
                    {question.text}
                  </p>
                  <span className="absolute right-0 top-0 h-2 w-2 bg-accent/70" aria-hidden="true" />
                </article>
                {index < questions.length - 1 && (
                  <div className="flex items-center justify-center text-accent/60" aria-hidden="true">
                    <ArrowDown className="lg:hidden" size={20} strokeWidth={1.4} />
                    <ArrowRight className="hidden lg:block" size={22} strokeWidth={1.4} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={processRef} className="border-t border-accent/15 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <SectionLabel index="03">PROCESSO</SectionLabel>
          <SectionTitle>
            DO DESAFIO
            <span className="block text-accent">À SOLUÇÃO._</span>
          </SectionTitle>

          <div className="relative mt-12 grid gap-9 lg:grid-cols-6 lg:gap-6">
            <span className={`${styles.processLine} ${processEntered ? styles.processLineActive : ""}`} aria-hidden="true" />
            {steps.map(([number, title, description, IconComponent], index) => (
              <article
                key={number}
                className={`relative z-10 grid grid-cols-[64px_1fr] gap-5 lg:block ${styles.processStep} ${processEntered ? styles.processStepActive : ""}`}
                style={{ transitionDelay: `${180 + index * 130}ms` }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/55 bg-background text-accent">
                  <IconComponent className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-mono text-[0.68rem] font-semibold tracking-[0.1em] text-accent/70">{number}</span>
                  <h3 className="mt-2 font-display text-sm font-semibold uppercase leading-[1.18]">{title}</h3>
                  <p className="mt-3 max-w-[180px] font-display text-sm leading-6 text-foreground/58">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-accent/15 py-16 md:py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 md:px-10 lg:grid-cols-[0.3fr_0.7fr] lg:items-center">
          <div>
            <SectionLabel index="04">QUEM FAZ ACONTECER</SectionLabel>
            <SectionTitle>
              NINGUÉM
              <span className="block">CONSTRÓI</span>
              <span className="block text-accent">SOZINHO._</span>
            </SectionTitle>
          </div>

          <div className="relative md:min-h-[500px]">
            <svg className="absolute inset-0 hidden h-full w-full text-accent md:block" viewBox="0 0 820 500" fill="none" aria-hidden="true">
              <g className={styles.networkLines} stroke="currentColor" strokeWidth="1">
                <path d="M410 130L190 250L270 370L550 370L630 250Z" />
                <path d="M410 130L410 270M190 250L410 270M270 370L410 270M550 370L410 270M630 250L410 270" opacity=".55" />
              </g>
              <g fill="currentColor" opacity=".7">
                <circle cx="410" cy="130" r="3" /><circle cx="190" cy="250" r="3" />
                <circle cx="630" cy="250" r="3" /><circle cx="270" cy="370" r="3" />
                <circle cx="550" cy="370" r="3" />
              </g>
            </svg>

            <div className="relative ml-3 grid gap-6 border-l border-accent/20 pl-7 md:ml-0 md:block md:min-h-[500px] md:border-0 md:pl-0">
              <span className={`${styles.centralNode} absolute -left-[6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent md:left-1/2 md:top-[54%] md:-translate-x-1/2`} aria-hidden="true" />
              {roles.map(([title, description, IconComponent, position]) => (
                <article key={title} className={`relative flex gap-4 border-t border-accent/20 pt-4 md:absolute md:w-[220px] md:border-0 md:pt-0 ${position}`}>
                  <span className="absolute -left-[29px] top-5 h-px w-7 bg-accent/35 md:hidden" aria-hidden="true" />
                  <IconComponent className="mt-1 h-8 w-8 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <h3 className="font-display text-sm font-semibold uppercase">{title}</h3>
                    <p className="mt-2 font-display text-sm leading-6 text-foreground/55">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-accent/15 py-20 md:py-28 lg:py-36">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-3 overflow-hidden" aria-hidden="true">
          {words.map((word, index) => (
            <p key={word} className={`${styles.kineticLine} ${index % 2 ? styles.kineticReverse : ""} whitespace-nowrap font-display text-[clamp(3.4rem,9vw,9rem)] font-semibold uppercase leading-[0.82] text-foreground/[0.035]`}>
              {word} {word}
            </p>
          ))}
        </div>

        <div className="relative mx-auto grid max-w-[1360px] gap-14 px-6 md:px-10 lg:grid-cols-[0.5fr_0.5fr] lg:items-center">
          <div>
            <SectionLabel index="05">EXPERIÊNCIA</SectionLabel>
            <h2 className="mt-6 font-display text-[clamp(2.3rem,4.8vw,5rem)] font-semibold uppercase leading-[1.08]">
              VOCÊ ENTRA
              <span className="block">COM O QUE</span>
              <span className="block">SABE.</span>
              <span className="mt-9 block text-accent">E SAI COM</span>
              <span className="block text-accent">O QUE CONSTRUIU._</span>
            </h2>
          </div>

          <div>
            <p className="max-w-[560px] font-display text-base leading-7 text-foreground/68">
              O HackIF não é apenas sobre encontrar uma solução. É sobre tudo o que acontece enquanto você tenta construí-la.
            </p>
            <div className="mt-9 border-y border-accent/22">
              <div className="grid grid-cols-[1fr_auto_1fr] border-b border-accent/16 py-4 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-foreground/38">
                <span>ANTES</span><span aria-hidden="true" /><span>DEPOIS</span>
              </div>
              {[
                ["CONHECIMENTO", "EXPERIÊNCIA"],
                ["CURIOSIDADE", "PROJETO"],
                ["IDEIA", "COLABORAÇÃO"],
              ].map(([before, after]) => (
                <div key={before} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-accent/10 py-5 last:border-0">
                  <span className="font-display text-sm font-semibold uppercase text-foreground/58">{before}</span>
                  <ArrowRight size={18} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
                  <span className="font-display text-sm font-semibold uppercase text-accent">{after}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={resultRef} className="border-t border-accent/15 py-16 md:py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1360px] gap-14 px-6 md:px-10 xl:grid-cols-[0.37fr_0.63fr] xl:items-center">
          <div>
            <SectionLabel index="06">RESULTADO</SectionLabel>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,4.4vw,5rem)] font-semibold uppercase leading-[1.08]">
              PROBLEMAS
              <span className="block">EXISTEM.</span>
              <span className="mt-5 block">IDEIAS</span>
              <span className="block">TAMBÉM.</span>
              <span className="mt-8 block text-[clamp(1.35rem,2.4vw,2.6rem)] leading-[1.12]">
                O QUE ACONTECE
                <span className="block">QUANDO COLOCAMOS</span>
                <span className="block text-accent">OS DOIS JUNTOS?</span>
              </span>
            </h2>
          </div>

          <div className={resultEntered ? styles.resultActive : ""}>
            <div className="relative hidden min-h-[450px] lg:block">
              <svg className="absolute inset-0 h-full w-full text-accent/45" viewBox="0 0 1000 450" fill="none" preserveAspectRatio="none" aria-hidden="true">
                {[70, 170, 270, 370].map((y) => (
                  <path key={y} className={styles.convergencePath} pathLength="1" d={`M240 ${y} C350 ${y},350 225,440 225`} stroke="currentColor" strokeWidth="1" />
                ))}
                <path className={styles.convergencePath} pathLength="1" d="M620 225H760" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {formula.map(([label, IconComponent], index) => (
                <div key={label} className="absolute left-0 flex h-10 w-[24%] items-center gap-4 border-l border-accent/35 pl-4" style={{ top: `${50 + index * 100}px` }}>
                  <IconComponent className="h-7 w-7 shrink-0 text-accent" aria-hidden="true" />
                  <span className="font-display text-sm font-semibold uppercase">{label}</span>
                </div>
              ))}
              <div className="absolute left-[44%] top-1/2 w-[18%] -translate-y-1/2 border border-accent/55 bg-background px-5 py-7 text-center">
                <Network className="mx-auto h-9 w-9 text-accent" aria-hidden="true" />
                <p className="mt-4 font-mono text-[0.7rem] font-semibold uppercase text-accent">PROCESSO</p>
              </div>
              <div className="absolute left-[76%] top-1/2 w-[24%] -translate-y-1/2 border border-accent/70 px-5 py-8 text-center text-accent">
                <Award className="mx-auto h-12 w-12" aria-hidden="true" />
                <p className="mt-4 font-display text-xl font-semibold uppercase">SOLUÇÃO REAL._</p>
              </div>
            </div>

            <div className="lg:hidden">
              <div className="grid grid-cols-2 gap-4">
                {formula.map(([label, IconComponent]) => (
                  <div key={label} className="flex items-center gap-3 border-l border-accent/35 py-3 pl-4">
                    <IconComponent className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                    <span className="font-display text-xs font-semibold uppercase">{label}</span>
                  </div>
                ))}
              </div>
              <ArrowDown className="mx-auto my-7 text-accent/65" size={24} strokeWidth={1.4} aria-hidden="true" />
              <div className="mx-auto w-[160px] border border-accent/55 px-5 py-6 text-center">
                <Network className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
                <p className="mt-3 font-mono text-[0.68rem] font-semibold uppercase text-accent">PROCESSO</p>
              </div>
              <ArrowDown className="mx-auto my-7 text-accent/65" size={24} strokeWidth={1.4} aria-hidden="true" />
              <div className="border border-accent/70 px-6 py-7 text-center text-accent">
                <Award className="mx-auto h-11 w-11" aria-hidden="true" />
                <p className="mt-4 font-display text-xl font-semibold uppercase">SOLUÇÃO REAL._</p>
              </div>
            </div>

            <p className="mt-8 border-t border-accent/20 pt-4 font-display text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-foreground/45">
              CONHECIMENTO + COLABORAÇÃO + TEMPO // TRANSFORMAÇÃO
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-accent/15 py-20 md:py-28 lg:py-40">
        <div className="mx-auto max-w-[1360px] px-6 md:px-10">
          <SectionLabel index="07">PROPÓSITO</SectionLabel>
          <div className="mt-10 grid gap-16 lg:grid-cols-[0.58fr_0.42fr] lg:items-center">
            <h2 className="min-w-0 font-display text-[2.35rem] font-semibold uppercase leading-[1.06] sm:text-[clamp(2.8rem,5.4vw,5.8rem)]">
              IDEIAS NÃO
              <span className="block">NASCEM</span>
              <span className="block">PRONTAS.</span>
              <span className="mt-6 block text-accent">SÃO</span>
              <span className="block text-accent">CONSTRUÍDAS._</span>
            </h2>

            <div className="min-w-0 max-w-[500px] border-l border-accent/45 pl-7 lg:justify-self-end">
              <p className="font-display text-[clamp(1.25rem,2vw,1.8rem)] font-semibold leading-[1.35] text-foreground">
                O HackIF não entrega respostas prontas.
                <span className="mt-3 block text-accent">Cria o ambiente para construí-las.</span>
              </p>
              <Link href="/como-participar" className="mt-9 inline-flex min-h-12 items-center gap-2 bg-accent px-7 font-display text-[0.78rem] font-semibold uppercase !text-[#050706] transition-opacity hover:opacity-85">
                PARTICIPAR DO HACKIF
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
