"use client";

import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Empty, formatarData, Loading, Table } from "@/src/components/ui/app";

type Resultado = {
  publicado: boolean;
  publicadoEm?: string;
  criterios?: { id: string; nome: string; peso: number }[];
  ranking: {
    posicao: number;
    equipe: { nome: string };
    projeto: { nome: string; desafio: { titulo: string } | null };
    notaFinal?: number;
    mediasPorCriterio?: Record<string, number | null>;
  }[];
};

export default function ResultadosPage() {
  const { data, error, loading } = useApi<Resultado>("/api/resultados");
  const podio = data?.ranking.filter((l) => l.posicao <= 3) ?? [];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1440px] px-6 py-16 md:px-10">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">{"// resultados"}</p>
        <h1 className="mt-3 font-display text-[2.6rem] font-semibold uppercase leading-none tracking-[-0.03em] md:text-[3.6rem]">Resultados</h1>

        <div className="mt-10">
          {loading && !data ? <Loading /> : null}
          {error ? <Alert title={error.message} /> : null}
          {data && !data.publicado ? <Empty>Os resultados ainda não foram publicados pela organização</Empty> : null}
          {data?.publicado && data.ranking.length === 0 ? <Empty>Nenhum projeto classificado</Empty> : null}

          {data?.publicado && data.ranking.length > 0 ? (
            <>
              <p className="mb-8 font-mono text-[0.75rem] uppercase text-muted">Publicado em {formatarData(data.publicadoEm)}</p>
              <div className="grid gap-4 md:grid-cols-3">
                {podio.map((l) => (
                  <article key={`${l.posicao}-${l.projeto.nome}`} className={`border p-6 ${l.posicao === 1 ? "border-accent" : "border-foreground/15"}`}>
                    <p className="font-display text-[3.4rem] font-semibold leading-none text-accent">{l.posicao}º</p>
                    <h2 className="mt-4 font-display text-[1.5rem] font-semibold uppercase leading-tight">{l.projeto.nome}</h2>
                    <p className="mt-1 text-foreground/70">{l.equipe.nome}</p>
                    {l.projeto.desafio ? <p className="mt-3 font-mono text-[0.72rem] uppercase text-muted">{l.projeto.desafio.titulo}</p> : null}
                    {l.notaFinal != null ? <p className="mt-3 font-mono text-[1.1rem] text-accent">{l.notaFinal}</p> : null}
                  </article>
                ))}
              </div>

              <div className="mt-10 border border-foreground/10 p-5">
                <Table head={["#", "Projeto", "Equipe", ...(data.criterios?.map((c) => c.nome) ?? []), ...(data.criterios ? ["Nota final"] : [])]}>
                  {data.ranking.map((l) => (
                    <tr key={`${l.posicao}-${l.projeto.nome}`}>
                      <td className="font-display text-[1.2rem] text-accent">{l.posicao}</td>
                      <td><strong>{l.projeto.nome}</strong></td>
                      <td>{l.equipe.nome}</td>
                      {data.criterios?.map((c) => <td key={c.id} className="font-mono">{l.mediasPorCriterio?.[c.id] ?? "—"}</td>)}
                      {data.criterios ? <td className="font-mono font-semibold">{l.notaFinal}</td> : null}
                    </tr>
                  ))}
                </Table>
              </div>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
