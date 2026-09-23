import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EdicaoHome } from "../home/types";

const eventLabelPadrao = "// HACKATHON DE CIÊNCIA DA COMPUTAÇÃO";
const headlineLineOne = "IDEIAS N\u00c3O";
const headlineLineThree = "ELAS S\u00c3O";
const headlineLineFour = "CONSTRU\u00cdDAS._";
const descricaoPadrao = "Reúna sua equipe, aceite o desafio e transforme problemas reais em soluções inovadoras.";
const rotuloStatus: Record<string, string> = {
  INSCRICOES_ABERTAS: "INSCRIÇÕES ABERTAS",
  EM_ANDAMENTO: "EVENTO EM ANDAMENTO",
  ENCERRADO: "EDIÇÃO ENCERRADA",
};

export function HeroContent({ edicao }: { edicao: EdicaoHome | null }) {
  const status = edicao ? (rotuloStatus[edicao.status] ?? edicao.status) : "EDIÇÃO EM PREPARAÇÃO";
  const chamada = edicao?.inscricoesAbertas
    ? { href: "/cadastro", label: "INSCREVA SUA EQUIPE" }
    : { href: "/hackathon", label: "ACOMPANHE A EDIÇÃO" };

  return (
    <div className="relative z-20 flex h-full w-full max-w-[720px] flex-col justify-center py-6 lg:py-0">
      <div className="mb-5 flex items-start gap-3 font-display text-[0.68rem] font-semibold uppercase tracking-[0.04em] text-foreground/58 sm:text-[0.74rem]">
        <span className="text-accent">01</span>
        <span>{edicao ? `// ${edicao.nome}` : eventLabelPadrao}</span>
      </div>

      <div className="relative">
        <h1
          id="hero-title"
          className="font-display text-[clamp(2.7rem,3.35vw,4.15rem)] font-semibold uppercase leading-[1.04] tracking-[0.025em]"
        >
          <span className="relative block text-foreground">
            {headlineLineOne}
          </span>
          <span className="block text-foreground">NASCEM PRONTAS.</span>
          <span className="relative block text-accent">
            {headlineLineThree}
          </span>
          <span className="relative block text-accent">
            {headlineLineFour}
          </span>
        </h1>
      </div>

      <p className="mt-5 max-w-[520px] font-sans text-base leading-[1.65] text-foreground/62">{edicao?.descricao ?? descricaoPadrao}</p>

      <div className="mt-7 flex flex-wrap items-center gap-5">
        <Link
          href={chamada.href}
          className="flex h-[52px] min-w-[225px] items-center justify-between bg-accent px-6 font-display text-[0.75rem] font-bold uppercase tracking-[0.02em] !text-[#050706] transition-colors duration-200 hover:bg-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {chamada.label}
          <ArrowUpRight
            size={14}
            strokeWidth={1.8}
            className="ml-5 shrink-0 !text-[#050706]"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="/hackathon"
          className="flex h-[52px] min-w-[175px] items-center justify-between border border-accent/30 bg-transparent px-6 font-display text-[0.75rem] font-bold uppercase tracking-[0.02em] text-foreground/88 transition-colors duration-200 hover:border-accent/70 hover:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          SAIBA MAIS
          <ArrowUpRight size={14} strokeWidth={1.8} className="ml-5 shrink-0 text-accent" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 font-display text-[0.7rem] font-semibold uppercase tracking-[0.04em] sm:text-[0.72rem]">
        <span className="text-foreground/55">{"> STATUS: "}</span>
        <span className="text-accent">{status}</span>
        <span className="ml-2 inline-block animate-[pulse_2.4s_ease-in-out_infinite] text-accent">
          {"\u25cf"}
        </span>
      </div>
    </div>
  );
}
