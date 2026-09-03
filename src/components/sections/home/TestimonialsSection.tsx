"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

// MOCK/PLACEHOLDER: substituir pelos depoimentos reais do HackIF.
const testimonials = [
  {
    quote: "Participar de um hackathon é descobrir que uma boa solução cresce quando diferentes ideias começam a trabalhar juntas.",
    author: "PARTICIPANTE // CONTEÚDO PROVISÓRIO",
    meta: "Equipe / Projeto",
  },
  {
    quote: "O desafio força a equipe a pensar com clareza, testar rápido e transformar conversa em construção.",
    author: "PARTICIPANTE // CONTEÚDO PROVISÓRIO",
    meta: "Equipe / Projeto",
  },
  {
    quote: "A experiência mostra que tecnologia também é escuta, colaboração e coragem para tentar uma primeira versão.",
    author: "PARTICIPANTE // CONTEÚDO PROVISÓRIO",
    meta: "Equipe / Projeto",
  },
] as const;

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonial = testimonials[activeIndex];

  function showPrevious() {
    setActiveIndex((current) => current === 0 ? testimonials.length - 1 : current - 1);
  }

  function showNext() {
    setActiveIndex((current) => current === testimonials.length - 1 ? 0 : current + 1);
  }

  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
          <span className="text-accent">06 //</span> EXPERIÊNCIAS
        </p>
        <div className="mt-7 grid gap-16 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <h2 className="font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
            <span className="block text-foreground">QUEM CONSTRÓI</span>
            <span className="block text-accent">TEM HISTÓRIAS PARA CONTAR._</span>
          </h2>

          <div className="border-l border-accent/24 pl-6 md:pl-10">
            <blockquote className="font-display text-[clamp(1.7rem,3.5vw,4rem)] font-semibold uppercase leading-[1.04] text-foreground">
              “{activeTestimonial.quote}”
            </blockquote>
            <div className="mt-10 border-t border-foreground/10 pt-8">
              <p className="font-display text-[0.82rem] font-semibold uppercase text-accent">{activeTestimonial.author}</p>
              <p className="mt-2 font-display text-[0.9rem] text-foreground/48">{activeTestimonial.meta}</p>
            </div>
            <div className="mt-12 flex items-center justify-between gap-6">
              <span className="font-display text-[0.9rem] font-semibold text-foreground/58">
                {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </span>
              <div className="flex gap-3">
                <button type="button" onClick={showPrevious} className="grid h-12 w-12 place-items-center border border-foreground/18 text-accent transition-colors hover:border-accent hover:bg-accent hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" aria-label="Depoimento anterior">
                  <ArrowLeft size={20} strokeWidth={1.6} aria-hidden="true" />
                </button>
                <button type="button" onClick={showNext} className="grid h-12 w-12 place-items-center border border-foreground/18 text-accent transition-colors hover:border-accent hover:bg-accent hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" aria-label="Próximo depoimento">
                  <ArrowRight size={20} strokeWidth={1.6} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
