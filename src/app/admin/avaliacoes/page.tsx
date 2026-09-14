"use client";

import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Badge, Empty, Loading, PageHeader, Panel, Stat, Table } from "@/src/components/ui/app";

type Contagem = { total: number; concluidas: number; pendentes: number };
type Resposta = {
  total: number;
  concluidas: number;
  porJurado: (Contagem & { jurado: { id: string; nome: string } })[];
  porProjeto: (Contagem & { projeto: { id: string; nome: string; equipe: string } })[];
};

const progresso = (c: Contagem) => (
  <Badge tone={c.pendentes === 0 ? "ok" : "alerta"}>{c.concluidas}/{c.total}</Badge>
);

export default function AdminAvaliacoesPage() {
  const { url } = useHackathon();
  const { data, error, loading } = useApi<Resposta>(url("/api/admin/avaliacoes"));

  return (
    <>
      <PageHeader tag="admin/avaliacoes" title="Avaliações" description="Acompanhamento das atribuições pendentes e concluídas." />
      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} /> : null}
      {data ? (
        <div className="grid min-w-0 grid-cols-1 gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Atribuições" value={data.total} />
            <Stat label="Concluídas" value={data.concluidas} />
            <Stat label="Pendentes" value={data.total - data.concluidas} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Por jurado">
              {data.porJurado.length === 0 ? <Empty>Sem atribuições</Empty> : (
                <Table head={["Jurado", "Progresso", "Pendentes"]}>
                  {data.porJurado.map((j) => (
                    <tr key={j.jurado.id}><td>{j.jurado.nome}</td><td>{progresso(j)}</td><td>{j.pendentes}</td></tr>
                  ))}
                </Table>
              )}
            </Panel>
            <Panel title="Por projeto">
              {data.porProjeto.length === 0 ? <Empty>Sem atribuições</Empty> : (
                <Table head={["Projeto", "Equipe", "Progresso"]}>
                  {data.porProjeto.map((p) => (
                    <tr key={p.projeto.id}><td>{p.projeto.nome}</td><td>{p.projeto.equipe}</td><td>{progresso(p)}</td></tr>
                  ))}
                </Table>
              )}
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}
