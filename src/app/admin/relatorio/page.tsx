"use client";

import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { comHackathon } from "@/src/lib/api-client";
import { Alert, Badge, Empty, formatarData, Loading, PageHeader, Panel, Stat, Table } from "@/src/components/ui/app";

type Relatorio = {
  edicao: { nome: string; status: string; local: string | null; dataInicio: string; dataFim: string; resultadosPublicados: boolean };
  participantes: {
    contasDeParticipante: number;
    emEquipes: number;
    inscritos: number;
    presentes: number;
    taxaPresenca: number | null;
    porVinculo: Record<string, number>;
    porCurso: Record<string, number>;
  };
  equipes: { total: number; porSituacao: Record<string, number>; limite: number | null };
  projetos: { total: number; porSituacao: Record<string, number> };
  avaliacao: { jurados: number; juradosComAtribuicao: number; atribuicoes: number; concluidas: number };
  comunicacao: { comunicadosPublicados: number; mudancasDeAgendaComunicadas: number };
  podio: { posicao: number; projeto: string; equipe: string; notaFinal: number | null }[] | null;
};

const linhas = (m: Record<string, number>) => Object.entries(m).sort((a, b) => b[1] - a[1]);
const botaoCsv = "inline-flex h-10 items-center border border-foreground/20 px-4 text-[0.78rem] font-bold uppercase hover:border-accent hover:text-accent";

/** Relatório para a coordenação do curso: números consolidados e planilhas (prestação de contas). */
export default function AdminRelatorioPage() {
  const { url, hackathonId } = useHackathon();
  const { data, error, loading } = useApi<Relatorio>(url("/api/admin/relatorio"));

  return (
    <>
      <PageHeader
        tag="admin/relatorio"
        title="Relatório da edição"
        description="Números consolidados para divulgação institucional e prestação de contas. As planilhas abrem direto no Excel."
        actions={
          <>
            <a className={botaoCsv} href={comHackathon("/api/admin/relatorio/participantes", hackathonId)}>Participantes (CSV)</a>
            <a className={botaoCsv} href={comHackathon("/api/admin/relatorio/equipes", hackathonId)}>Equipes (CSV)</a>
            <a className={botaoCsv} href={comHackathon("/api/admin/relatorio/resultado", hackathonId)}>Resultado (CSV)</a>
          </>
        }
      />
      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} /> : null}

      {data ? (
        <div className="grid min-w-0 grid-cols-1 gap-6">
          <Panel title={data.edicao.nome} actions={<Badge tone="ok">{data.edicao.status}</Badge>}>
            <p className="text-[0.9rem] text-muted">
              {formatarData(data.edicao.dataInicio)} → {formatarData(data.edicao.dataFim)}{data.edicao.local ? ` · ${data.edicao.local}` : ""}
            </p>
          </Panel>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Inscritos" value={data.participantes.inscritos} sub={`${data.participantes.emEquipes} em equipes · ${data.participantes.contasDeParticipante} contas`} />
            <Stat label="Presentes" value={data.participantes.presentes} sub={data.participantes.taxaPresenca == null ? "sem inscritos" : `${data.participantes.taxaPresenca}% dos inscritos`} />
            <Stat label="Equipes" value={data.equipes.total} sub={data.equipes.limite ? `limite ${data.equipes.limite}` : "sem limite"} />
            <Stat label="Projetos" value={data.projetos.total} sub={`${data.projetos.porSituacao.ENVIADO ?? 0} enviados`} />
            <Stat label="Jurados" value={data.avaliacao.jurados} sub={`${data.avaliacao.juradosComAtribuicao} com projetos`} />
            <Stat label="Avaliações" value={`${data.avaliacao.concluidas}/${data.avaliacao.atribuicoes}`} sub="concluídas" />
            <Stat label="Comunicados" value={data.comunicacao.comunicadosPublicados} sub={`${data.comunicacao.mudancasDeAgendaComunicadas} de mudança de agenda`} />
            <Stat label="Resultado" value={data.edicao.resultadosPublicados ? "publicado" : "—"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Inscritos por vínculo">
              {linhas(data.participantes.porVinculo).length === 0 ? <Empty>Sem inscritos</Empty> : (
                <Table head={["Vínculo", "Pessoas"]}>
                  {linhas(data.participantes.porVinculo).map(([k, v]) => <tr key={k}><td>{k}</td><td className="font-mono">{v}</td></tr>)}
                </Table>
              )}
            </Panel>
            <Panel title="Inscritos por curso">
              {linhas(data.participantes.porCurso).length === 0 ? <Empty>Sem curso informado</Empty> : (
                <Table head={["Curso", "Pessoas"]}>
                  {linhas(data.participantes.porCurso).map(([k, v]) => <tr key={k}><td>{k}</td><td className="font-mono">{v}</td></tr>)}
                </Table>
              )}
            </Panel>
            <Panel title="Equipes por situação">
              <Table head={["Situação", "Equipes"]}>
                {linhas(data.equipes.porSituacao).map(([k, v]) => <tr key={k}><td>{k}</td><td className="font-mono">{v}</td></tr>)}
              </Table>
            </Panel>
          </div>

          <Panel title="Pódio">
            {!data.podio ? <Empty>Resultado ainda não publicado</Empty> : (
              <Table head={["#", "Projeto", "Equipe", "Nota final"]}>
                {data.podio.map((l) => (
                  <tr key={`${l.posicao}-${l.projeto}`}>
                    <td className="font-display text-[1.2rem] text-accent">{l.posicao}</td>
                    <td><strong>{l.projeto}</strong></td>
                    <td>{l.equipe}</td>
                    <td className="font-mono">{l.notaFinal ?? "—"}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Panel>
        </div>
      ) : null}
    </>
  );
}
