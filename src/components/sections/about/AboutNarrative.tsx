"use client";

import {
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
import type { ComponentType, SVGProps } from "react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const questions = [
  ["01", "COMO TRANSFORMAR", "CONHECIMENTO", "EM EXPERIÊNCIA?"],
  ["02", "COMO APRENDER", "COM PROBLEMAS", "SEM RESPOSTAS", "PRONTAS?"],
  ["03", "COMO TRANSFORMAR", "UMA IDEIA", "EM ALGO REAL?"],
];

const steps: Array<[string, string, string, Icon]> = [
  ["01", "INSCREVA-SE", "Entre no HackIF e forme sua equipe.", User],
  [
    "02",
    "CONHEÇA O DESAFIO",
    "Entenda o problema que deverá ser enfrentado.",
    Braces,
  ],
  ["03", "INVESTIGUE", "Pesquise, questione e encontre oportunidades.", Search],
  ["04", "CONSTRUA", "Transforme a ideia em uma solução.", Network],
  [
    "05",
    "APRESENTE",
    "Mostre o projeto, as decisões e o impacto proposto.",
    MonitorUp,
  ],
  [
    "06",
    "RESULTADO",
    "As soluções são avaliadas e os destaques reconhecidos.",
    Trophy,
  ],
];

const roles: Array<[string, string, Icon, string]> = [
  [
    "PARTICIPANTES",
    "Transformam conhecimento em soluções.",
    Users,
    "md:left-1/2 md:top-0 md:-translate-x-1/2",
  ],
  [
    "MENTORES",
    "Orientam decisões e ajudam as equipes durante o processo.",
    User,
    "md:left-0 md:top-1/3",
  ],
  [
    "PROFESSORES",
    "Apoiam o desenvolvimento técnico e acadêmico.",
    GraduationCap,
    "md:left-[12%] md:bottom-4",
  ],
  [
    "JURADOS",
    "Avaliam as soluções e seus impactos.",
    Users,
    "md:right-0 md:top-1/3",
  ],
  [
    "ORGANIZAÇÃO",
    "Estrutura o evento e conecta todas as etapas.",
    Network,
    "md:right-[10%] md:bottom-5",
  ],
];

const words = [
  "COLABORAÇÃO",
  "APRENDIZADO",
  "TECNOLOGIA",
  "CRIATIVIDADE",
  "EXPERIÊNCIA",
  "IMPACTO",
];

const formula: Array<[string, string, Icon]> = [
  ["PROBLEMA", "?", Search],
  ["IDEIA", "!", Lightbulb],
  ["EQUIPE", "+", Users],
  ["TEMPO", ":", Clock3],
];

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
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
  return (
    <>
      <section className="border-t border-accent/15 py-16 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 md:px-10 lg:grid-cols-[0.28fr_0.72fr] lg:items-center">
          <div>
            <SectionLabel index="02">POR QUE EXISTE</SectionLabel>
            <SectionTitle>
              TUDO COMEÇA
              <span className="block text-accent">COM PERGUNTAS._</span>
            </SectionTitle>
            <span className="mt-8 block h-px w-10 bg-accent" />
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            {questions.map(([number, ...lines]) => (
              <div key={number} className="contents">
                <div className="relative border-l border-accent/35 pl-5 lg:flex-1 lg:border-l-0 lg:pl-0">
                  <span className="font-display text-4xl font-semibold text-foreground/10">
                    {number}
                  </span>
                  <p className="mt-4 font-display text-[clamp(1rem,1.25vw,1.2rem)] font-semibold uppercase leading-[1.25] text-foreground">
                    {lines.map((line) => (
                      <span key={line} className="block">
                        {line.includes("EXPERIÊNCIA") ||
                        line.includes("RESPOSTAS") ||
                        line.includes("PRONTAS") ||
                        line.includes("REAL") ? (
                          <span className="text-accent">{line}</span>
                        ) : (
                          line
                        )}
                      </span>
                    ))}
                  </p>
                </div>
                <span className="font-display text-2xl text-accent lg:px-3">
                  →
                </span>
              </div>
            ))}
            <div className="font-display text-xl font-semibold uppercase text-accent">
              HACKIF._
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-accent/15 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10">
          <SectionLabel index="03">PROCESSO</SectionLabel>
          <SectionTitle>
            DO DESAFIO
            <span className="block text-accent">À SOLUÇÃO._</span>
          </SectionTitle>

          <div className="relative mt-10 grid gap-8 md:grid-cols-3 lg:grid-cols-6">
            <div
              className="absolute left-8 right-8 top-8 hidden h-px bg-accent/45 lg:block"
              aria-hidden="true"
            />
            {steps.map(([number, title, description, IconComponent]) => (
              <div key={number} className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/55 bg-background text-accent">
                  <IconComponent className="h-7 w-7" aria-hidden="true" />
                </div>
                <span className="mt-5 block font-display text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-accent/70">
                  {number}
                </span>
                <h3 className="mt-2 font-display text-sm font-semibold uppercase leading-[1.18]">
                  {title}
                </h3>
                <p className="mt-3 max-w-[170px] font-display text-sm leading-6 text-foreground/58">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-accent/15 py-16 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 md:px-10 lg:grid-cols-[0.28fr_0.72fr] lg:items-center">
          <div>
            <SectionLabel index="04">QUEM FAZ ACONTECER</SectionLabel>
            <SectionTitle>
              NINGUÉM
              <span className="block">CONSTRÓI</span>
              <span className="block text-accent">SOZINHO._</span>
            </SectionTitle>
          </div>

          <div className="relative min-h-[560px] overflow-hidden md:min-h-[440px]">
            <div className="absolute left-1/2 top-1/2 hidden h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/15 md:block" />
            <div className="absolute left-1/2 top-1/2 hidden h-px w-[78%] -translate-x-1/2 bg-accent/25 md:block" />
            <div className="absolute left-1/2 top-[18%] hidden h-[64%] w-px -translate-x-1/2 bg-accent/20 md:block" />
            <div className="relative z-10 mx-auto mb-10 flex h-28 w-28 items-center justify-center border border-accent/65 bg-background font-display font-semibold uppercase text-accent md:absolute md:left-1/2 md:top-1/2 md:mb-0 md:-translate-x-1/2 md:-translate-y-1/2">
              HACKIF
            </div>

            <div className="grid gap-5 md:block">
              {roles.map(([title, description, IconComponent, position]) => (
                <div
                  key={title}
                  className={`relative flex gap-4 border-l border-accent/35 pl-5 md:absolute md:w-64 md:border-l-0 md:pl-0 ${position}`}
                >
                  <IconComponent
                    className="mt-1 h-9 w-9 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-sm font-semibold uppercase leading-[1.18]">
                      {title}
                    </h3>
                    <p className="mt-2 font-display text-sm leading-6 text-foreground/58">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-accent/15 py-16 md:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="grid h-full w-full grid-cols-1 content-center gap-x-16 gap-y-5 px-8 opacity-[0.035] md:grid-cols-2 lg:grid-cols-3">
            {words.map((word) => (
              <span
                key={word}
                className="font-display text-[clamp(2.4rem,5.2vw,5.2rem)] font-semibold uppercase leading-none"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto grid w-[calc(100%-48px)] max-w-[1360px] gap-12 md:grid-cols-[0.48fr_0.4fr] md:items-center md:justify-between">
          <div>
            <SectionLabel index="05">EXPERIÊNCIA</SectionLabel>
            <h2 className="mt-6 font-display text-[clamp(2.3rem,4.8vw,5rem)] font-semibold uppercase leading-[1.08]">
              VOCÊ ENTRA
              <span className="block">COM O QUE</span>
              <span className="block">SABE.</span>
              <span className="mt-9 block text-accent">
                E SAI COM
                <span className="block">O QUE CONSTRUIU._</span>
              </span>
            </h2>
          </div>

          <div className="border-l border-accent/55 pl-7">
            <p className="font-display text-base leading-7 text-foreground/72">
              O HackIF não é apenas sobre encontrar uma solução. É sobre tudo o
              que acontece enquanto você tenta construí-la.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 font-display text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-accent">
              <span>{`01 // EXPERIMENTAR`}</span>
              <span className="hidden h-px w-8 self-center bg-accent/45 sm:block" />
              <span>{`02 // COLABORAR`}</span>
              <span className="hidden h-px w-8 self-center bg-accent/45 sm:block" />
              <span>{`03 // APRENDER`}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-accent/15 py-16 md:py-24 lg:py-32">
        <div className="mx-auto grid w-[calc(100%-48px)] max-w-[1360px] gap-12 xl:grid-cols-[0.38fr_0.62fr] xl:items-center">
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

          <div>
            <div className="grid gap-5 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1.25fr] xl:items-center xl:gap-3">
              {formula.map(([label, glyph, IconComponent], index) => (
                <div key={label} className="contents">
                  <div className="relative text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center border border-accent/40 text-accent xl:h-[118px] xl:w-[118px]">
                      <IconComponent
                        className="h-11 w-11 xl:h-12 xl:w-12"
                        aria-hidden="true"
                      />
                      <span className="sr-only">{glyph}</span>
                    </div>
                    <p className="mt-4 font-display text-sm font-semibold uppercase">
                      {label}
                    </p>
                  </div>
                  <span className="text-center font-display text-3xl text-accent xl:self-center">
                    {index === formula.length - 1 ? (
                      <>
                        <span className="xl:hidden">↓</span>
                        <span className="hidden xl:inline">→</span>
                      </>
                    ) : (
                      "+"
                    )}
                  </span>
                </div>
              ))}
              <div className="border border-accent/70 px-6 py-8 text-center text-accent xl:px-7 xl:py-9">
                <Award className="mx-auto h-14 w-14 xl:h-16 xl:w-16" aria-hidden="true" />
                <p className="mt-5 font-display text-2xl font-semibold uppercase xl:text-3xl">
                  SOLUÇÃO._
                </p>
              </div>
            </div>

            <p className="mt-8 border-t border-accent/20 pt-4 font-display text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-foreground/45">
              CONHECIMENTO + COLABORAÇÃO + TEMPO // TRANSFORMAÇÃO
            </p>
            <div className="mt-10 text-center font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground/50">
              <p>MAS UMA SOLUÇÃO TAMBÉM PRECISA SER CONSTRUÍDA.</p>
              <p className="mt-3 text-2xl text-accent">↓</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-accent/15 py-16 md:py-24 lg:py-32">
        <div className="mx-auto w-[calc(100%-48px)] max-w-[1360px]">
          <SectionLabel index="07">PROPÓSITO</SectionLabel>
          <div className="mt-8 grid gap-12 lg:grid-cols-[0.5fr_0.27fr_0.23fr] lg:items-center">
            <div>
              <h2 className="font-display text-[clamp(2.8rem,5.4vw,5.8rem)] font-semibold uppercase leading-[1.06]">
                IDEIAS NÃO
                <span className="block">NASCEM</span>
                <span className="block">PRONTAS.</span>
                <span className="mt-6 block text-accent">SÃO</span>
                <span className="block text-accent">CONSTRUÍDAS._</span>
              </h2>
            </div>

            <div className="border-l border-accent/55 pl-7">
              <p className="font-display text-base leading-7 text-foreground/64">
                O HackIF é um espaço para experimentar, errar, aprender,
                colaborar e construir.
                <br />
                <br />
                Porque uma boa ideia é apenas o começo.
              </p>
              <Link
                href="/#participar"
                className="mt-8 inline-flex min-h-11 items-center bg-accent px-7 font-display text-[0.78rem] font-semibold uppercase text-background transition-opacity hover:opacity-85"
              >
                PARTICIPAR DO HACKIF ↗
              </Link>
            </div>

            <div className="border border-accent/45 p-7 font-display text-sm uppercase leading-7 text-accent">
              <p className="mb-6 text-[0.72rem] font-semibold tracking-[0.08em]">
                ● EVENT STATUS
              </p>
              <p>HACKIF // 2026</p>
              <p>IFPR — CAMPUS PINHAIS</p>
              <div className="mt-8 border-t border-accent/25 pt-5">
                <p>STATUS</p>
                <p>EM PREPARAÇÃO</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
