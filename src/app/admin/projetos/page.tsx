"use client";

import { useState } from "react";
import { Check, ExternalLink, Eye, FileText, X } from "lucide-react";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { api } from "@/src/lib/api-client";
import { Alert, Badge, Button, Empty, formatarData, Loading, PageHeader, Panel, Select, Table } from "@/src/components/ui/app";

type Projeto = {
  id: string;
  nome: string;
  situacao: "RASCUNHO" | "ENVIADO" | "DESCLASSIFICADO";
  enviadoEm: string | null;
  descricao: string;
  solucao: string | null;
  tecnologias: string[];
  links: { tipo: string; url: string }[];
  arquivos: { nome: string; url: string }[];
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

function DetalhesProjeto({ projeto, fechar }: { projeto: Projeto; fechar: () => void }) {
  return (
    <Panel
      title={`Detalhes · ${projeto.nome}`}
      className="mt-6"
      actions={(
        <button
          type="button"
          onClick={fechar}
          className="grid h-9 w-9 place-items-center border border-foreground/20 text-muted hover:border-accent hover:text-accent"
          aria-label="Fechar detalhes"
          title="Fechar detalhes"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={tom[projeto.situacao]}>{projeto.situacao}</Badge>
            <span className="font-mono text-[0.72rem] uppercase text-muted">{projeto.team.nome}</span>
            {projeto.desafio ? <span className="font-mono text-[0.72rem] uppercase text-accent">{projeto.desafio.titulo}</span> : null}
          </div>

          <section className="mt-6 border-t border-foreground/10 pt-5">
            <h3 className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">Descrição</h3>
            <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-7 text-foreground/85">{projeto.descricao}</p>
          </section>

          <section className="mt-6 border-t border-foreground/10 pt-5">
            <h3 className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">Solução</h3>
            <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-7 text-foreground/85">{projeto.solucao ?? "Não informada"}</p>
          </section>

          <section className="mt-6 border-t border-foreground/10 pt-5">
            <h3 className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">Tecnologias</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {projeto.tecnologias.length ? projeto.tecnologias.map((tecnologia) => <Badge key={tecnologia}>{tecnologia}</Badge>) : <span className="text-[0.88rem] text-muted">Não informadas</span>}
            </div>
          </section>
        </div>

        <div className="min-w-0 border-t border-foreground/10 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <dl className="grid grid-cols-2 gap-4 text-[0.85rem]">
            <div>
              <dt className="font-mono text-[0.68rem] uppercase text-muted">Enviado em</dt>
              <dd className="mt-1">{formatarData(projeto.enviadoEm)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.68rem] uppercase text-muted">Avaliações</dt>
              <dd className="mt-1">{projeto.atribuicoes.filter((a) => a.concluida).length}/{projeto.atribuicoes.length}</dd>
            </div>
          </dl>

          <section className="mt-7 border-t border-foreground/10 pt-5">
            <h3 className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">Links</h3>
            <div className="mt-3 grid gap-2">
              {projeto.links.length ? projeto.links.map((link) => (
                <a key={`${link.tipo}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center justify-between gap-3 border-b border-foreground/10 py-2 text-[0.88rem] text-accent hover:text-foreground">
                  <span className="truncate">{link.tipo}</span><ExternalLink size={16} className="shrink-0" aria-hidden="true" />
                </a>
              )) : <span className="text-[0.88rem] text-muted">Nenhum link</span>}
            </div>
          </section>

          <section className="mt-7 border-t border-foreground/10 pt-5">
            <h3 className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">Arquivos</h3>
            <div className="mt-3 grid gap-2">
              {projeto.arquivos.length ? projeto.arquivos.map((arquivo) => (
                <a key={`${arquivo.nome}-${arquivo.url}`} href={arquivo.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-3 border-b border-foreground/10 py-2 text-[0.88rem] text-accent hover:text-foreground">
                  <FileText size={16} className="shrink-0" aria-hidden="true" /><span className="truncate">{arquivo.nome}</span><ExternalLink size={14} className="ml-auto shrink-0" aria-hidden="true" />
                </a>
              )) : <span className="text-[0.88rem] text-muted">Nenhum arquivo</span>}
            </div>
          </section>

          <section className="mt-7 border-t border-foreground/10 pt-5">
            <h3 className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">Jurados atribuídos</h3>
            <ul className="mt-3 grid gap-2 text-[0.88rem]">
              {projeto.atribuicoes.length ? projeto.atribuicoes.map((atribuicao) => (
                <li key={atribuicao.juradoId} className="flex items-center justify-between gap-3">
                  <span>{atribuicao.jurado.nome}</span>
                  <Badge tone={atribuicao.concluida ? "ok" : "alerta"}>{atribuicao.concluida ? "concluída" : "pendente"}</Badge>
                </li>
              )) : <li className="text-muted">Nenhum jurado atribuído</li>}
            </ul>
          </section>
        </div>
      </div>
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
  const [detalhes, setDetalhes] = useState<string | null>(null);
  const [historico, setHistorico] = useState<string | null>(null);
  const projetoDetalhado = data?.projetos.find((projeto) => projeto.id === detalhes) ?? null;

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
                    <div key={a.juradoId} className="inline-flex items-center gap-1.5">
                      {a.jurado.nome}
                      {a.concluida ? <Check size={13} strokeWidth={2} className="text-accent" aria-hidden="true" /> : "…"}
                    </div>
                  ))}
                </td>
                <td><Badge tone={tom[p.situacao]}>{p.situacao}</Badge></td>
                <td className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="ghost" className="h-8 px-3" onClick={() => setDetalhes(detalhes === p.id ? null : p.id)}>
                      <Eye size={16} aria-hidden="true" /> {detalhes === p.id ? "Fechar" : "Detalhes"}
                    </Button>
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

      {projetoDetalhado ? <DetalhesProjeto projeto={projetoDetalhado} fechar={() => setDetalhes(null)} /> : null}
      {historico ? <HistoricoNotas projetoId={historico} /> : null}
    </>
  );
}
