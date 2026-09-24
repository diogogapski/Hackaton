"use client";

import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Empty, Loading } from "@/src/components/ui/app";

type Hackathon = { nome: string; regulamentoTexto: string | null; regulamentoUrl: string | null };

/** Regulamento da edição atual, vindo de `Hackathon.regulamentoTexto` / `regulamentoUrl`. */
export default function RegulamentoPage() {
  const { data, error, loading } = useApi<{ hackathon: Hackathon }>("/api/hackathon/atual");
  const h = data?.hackathon;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1440px] px-6 py-16 md:px-10">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">{"// regulamento"}</p>
        <h1 className="mt-3 font-display text-[2.6rem] font-semibold uppercase leading-none tracking-[-0.03em] md:text-[3.4rem]">Regulamento</h1>
        {h ? <p className="mt-3 text-muted">{h.nome}</p> : null}

        <div className="mt-10">
          {loading && !data ? <Loading /> : null}
          {error ? <Alert title={error.message} /> : null}
          {h && !h.regulamentoTexto && !h.regulamentoUrl ? <Empty>O regulamento ainda não foi publicado</Empty> : null}
          {h?.regulamentoUrl ? (
            <a
              href={h.regulamentoUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-8 inline-flex h-12 items-center bg-accent px-7 text-[0.82rem] font-bold uppercase !text-[#050706] hover:bg-foreground"
            >
              Abrir documento oficial
              <ArrowUpRight size={15} strokeWidth={2} className="ml-2" aria-hidden="true" />
            </a>
          ) : null}
          {h?.regulamentoTexto ? (
            <article className="whitespace-pre-line border-l-2 border-accent/40 pl-6 text-[1rem] leading-relaxed text-foreground/85">
              {h.regulamentoTexto}
            </article>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
