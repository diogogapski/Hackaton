"use client";

import Link from "next/link";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Badge, Empty, formatarData, Loading, PageHeader, Panel, Stat } from "@/src/components/ui/app";

type Dashboard = {
  hackathon: { id: string; nome: string; status: string; resultadosPublicados: boolean };
  usuariosParticipantes: number;
  equipes: { total: number; porSituacao: Record<string, number> };
  participantesEmEquipes: number;
  projetos: { total: number; porSituacao: Record<string, number> };
  jurados: number;
  avaliacoes: { pendentes: number; concluidas: number };
  proximaAgenda: { id: string; titulo: string; horarioInicio: string; local: string | null }[];
};

const porSituacao = (m: Record<string, number>) =>
  Object.entries(m).map(([k, v]) => <span key={k} className="mr-2">{k.toLowerCase()}: {v}</span>);

export default function AdminDashboardPage() {
  const { url } = useHackathon();
  const { data, error, loading } = useApi<Dashboard>(url("/api/admin/dashboard"));

  return (
    <>
      <PageHeader
        tag="admin/dashboard"
        title={data?.hackathon.nome ?? "Dashboard"}
        description="Visão geral da edição selecionada."
        actions={data ? (
          <>
            <Badge tone="ok">{data.hackathon.status}</Badge>
            <Badge tone={data.hackathon.resultadosPublicados ? "ok" : "neutro"}>
              {data.hackathon.resultadosPublicados ? "resultados publicados" : "resultados ocultos"}
            </Badge>
          </>
        ) : null}
      />

      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} lines={["Crie uma edição em Edições para começar."]} /> : null}

      {data ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Stat label="Participantes" value={data.usuariosParticipantes} sub={`${data.participantesEmEquipes} em equipes`} />
            <Stat label="Equipes" value={data.equipes.total} sub={porSituacao(data.equipes.porSituacao)} />
            <Stat label="Projetos" value={data.projetos.total} sub={porSituacao(data.projetos.porSituacao)} />
            <Stat label="Jurados" value={data.jurados} />
            <Stat label="Avaliações pendentes" value={data.avaliacoes.pendentes} />
            <Stat label="Avaliações concluídas" value={data.avaliacoes.concluidas} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Próximos itens da agenda">
              {data.proximaAgenda.length === 0 ? <Empty>Sem itens futuros</Empty> : (
                <ul className="grid gap-3">
                  {data.proximaAgenda.map((a) => (
                    <li key={a.id} className="flex justify-between gap-4 border-b border-foreground/8 pb-2 text-[0.9rem]">
                      <span>{a.titulo}</span>
                      <span className="font-mono text-[0.78rem] text-muted">{formatarData(a.horarioInicio)} · {a.local ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Fluxo de avaliação">
              <ol className="grid gap-2 text-[0.9rem] text-foreground/80">
                {[
                  ["Configure escala, limites e jurados por projeto", "/admin/edicoes"],
                  ["Cadastre critérios e pesos", "/admin/criterios"],
                  ["Autorize jurados e distribua projetos", "/admin/jurados"],
                  ["Acompanhe as avaliações", "/admin/avaliacoes"],
                  ["Revise o ranking e publique", "/admin/resultados"],
                ].map(([texto, href], i) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-accent">
                      <span className="mr-2 font-mono text-accent">{String(i + 1).padStart(2, "0")}</span>{texto}
                    </Link>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}
