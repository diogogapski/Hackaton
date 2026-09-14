"use client";

import { PaginaPublica } from "@/src/components/publico/PaginaPublica";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Empty, Loading } from "@/src/components/ui/app";

type Desafio = { id: string; titulo: string; descricao: string; categoria: string | null; responsavel: string | null };

/** Propostas/desafios publicados da edição (planejamento, página 3). */
export default function DesafiosPage() {
  const { data, error, loading } = useApi<{ desafios: Desafio[] }>("/api/desafios");

  return (
    <PaginaPublica tag="desafios" titulo="Propostas e desafios" descricao="Problemas reais propostos para esta edição. Escolha um ao enviar o projeto da sua equipe.">
      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} /> : null}
      {data?.desafios.length === 0 ? <Empty>Os desafios ainda não foram publicados</Empty> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {data?.desafios.map((d, i) => (
          <article key={d.id} className="flex flex-col border border-foreground/10 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 font-mono text-[0.72rem] uppercase text-muted">
              <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span>{d.categoria}</span>
            </div>
            <h2 className="mt-4 font-display text-[1.7rem] font-semibold uppercase leading-tight">{d.titulo}</h2>
            <p className="mt-4 flex-1 whitespace-pre-line text-[0.98rem] leading-relaxed text-foreground/75">{d.descricao}</p>
            {d.responsavel ? (
              <p className="mt-6 border-t border-foreground/10 pt-4 font-mono text-[0.72rem] uppercase text-muted">Proponente: <span className="text-foreground/80">{d.responsavel}</span></p>
            ) : null}
          </article>
        ))}
      </div>
    </PaginaPublica>
  );
}
