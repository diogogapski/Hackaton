"use client";

import { useState } from "react";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { api } from "@/src/lib/api-client";
import { Alert, Badge, Button, Empty, formatarData, Loading, PageHeader, Panel, Select, Table } from "@/src/components/ui/app";

type Projeto = {
  id: string;
  nome: string;
  situacao: "RASCUNHO" | "ENVIADO" | "DESCLASSIFICADO";
  enviadoEm: string | null;
  tecnologias: string[];
  links: { tipo: string; url: string }[];
  team: { nome: string; situacao: string };
  desafio: { titulo: string } | null;
  atribuicoes: { juradoId: string; concluida: boolean; jurado: { nome: string } }[];
};

const tom = { RASCUNHO: "neutro", ENVIADO: "ok", DESCLASSIFICADO: "erro" } as const;

type Registro = {
  id: string;
  notaAnterior: number | null;
  notaNova: number;
  comentario: string | null;
  registradoEm: string;
  jurado: { nome: string };
  criterio: { nome: string };
};

/** Trilha de auditoria (canvas: "apuração rastreável, com registro de quem lançou o quê"). */
function HistoricoNotas({ projetoId }: { projetoId: string }) {
  const { data, error, loading } = useApi<{ projeto: { nome: string }; registros: Registro[] }>(`/api/admin/projetos/${projetoId}/registros`);

  return (
    <Panel title={data ? `Histórico de notas · ${data.projeto.nome}` : "Histórico de notas"} className="mt-6">
      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} /> : null}
      {data?.registros.length === 0 ? <Empty>Nenhuma nota lançada</Empty> : null}
      {data && data.registros.length > 0 ? (
        <Table head={["Quando", "Jurado", "Critério", "Nota", "Comentário"]}>
          {data.registros.map((r) => (
            <tr key={r.id}>
              <td className="whitespace-nowrap font-mono text-[0.8rem]">{formatarData(r.registradoEm)}</td>
              <td>{r.jurado.nome}</td>
              <td>{r.criterio.nome}</td>
              <td className="whitespace-nowrap font-mono">
                {r.notaAnterior == null ? (
                  <span>{r.notaNova} <Badge>lançada</Badge></span>
                ) : (
                  <span>{r.notaAnterior} → {r.notaNova} <Badge tone="alerta">alterada</Badge></span>
                )}
              </td>
              <td className="text-[0.85rem] text-foreground/75">{r.comentario ?? "—"}</td>
            </tr>
          ))}
        </Table>
      ) : null}
    </Panel>
  );
}

export default function AdminProjetosPage() {
  const { url } = useHackathon();
  const [situacao, setSituacao] = useState("");
  const { data, error, loading, reload } = useApi<{ projetos: Projeto[] }>(
    url(`/api/admin/projetos${situacao ? `?situacao=${situacao}` : ""}`),
  );
  const [erro, setErro] = useState<string | null>(null);
  const [historico, setHistorico] = useState<string | null>(null);

  async function alterar(p: Projeto, nova: "DESCLASSIFICADO" | "ATIVO") {
    if (nova === "DESCLASSIFICADO" && !confirm(`Desclassificar "${p.nome}"? Ele sai do ranking.`)) return;
    try {
      setErro(null);
      await api(`/api/admin/projetos/${p.id}`, { method: "PUT", body: { situacao: nova } });
      reload();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        tag="admin/projetos"
        title="Projetos"
        description="Submissões das equipes. Só projetos ENVIADOS entram na distribuição de jurados e no ranking."
        actions={
          <Select value={situacao} onChange={(e) => setSituacao(e.target.value)} className="w-52">
            <option value="">Todas as situações</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="ENVIADO">Enviado</option>
            <option value="DESCLASSIFICADO">Desclassificado</option>
          </Select>
        }
      />
      {erro ? <div className="mb-4"><Alert title={erro} /></div> : null}
      <Panel>
        {loading && !data ? <Loading /> : null}
        {error ? <Alert title={error.message} /> : null}
        {data?.projetos.length === 0 ? <Empty>Nenhum projeto</Empty> : null}
        {data && data.projetos.length > 0 ? (
          <Table head={["Projeto", "Equipe", "Desafio", "Enviado em", "Jurados", "Situação", ""]}>
            {data.projetos.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.nome}</strong>
                  <div className="mt-1 text-[0.75rem] text-muted">{p.tecnologias.join(" · ")}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[0.75rem]">
                    {p.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">{l.tipo}</a>
                    ))}
                  </div>
                </td>
                <td>{p.team.nome}</td>
                <td>{p.desafio?.titulo ?? "—"}</td>
                <td className="whitespace-nowrap">{formatarData(p.enviadoEm)}</td>
                <td className="text-[0.8rem]">
                  {p.atribuicoes.length === 0 ? "—" : p.atribuicoes.map((a) => (
                    <div key={a.juradoId}>{a.jurado.nome} {a.concluida ? "✓" : "…"}</div>
                  ))}
                </td>
                <td><Badge tone={tom[p.situacao]}>{p.situacao}</Badge></td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="h-8 px-3" onClick={() => setHistorico(historico === p.id ? null : p.id)}>
                      {historico === p.id ? "Fechar histórico" : "Histórico de notas"}
                    </Button>
                    {p.situacao === "DESCLASSIFICADO" ? (
                      <Button variant="ghost" className="h-8 px-3" onClick={() => alterar(p, "ATIVO")}>Reativar</Button>
                    ) : (
                      <Button variant="danger" className="h-8 px-3" onClick={() => alterar(p, "DESCLASSIFICADO")}>Desclassificar</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : null}
      </Panel>

      {historico ? <HistoricoNotas projetoId={historico} /> : null}
    </>
  );
}
