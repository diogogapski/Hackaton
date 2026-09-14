"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/src/hooks/useApi";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Badge, Button, Field, Input, Loading, PageHeader, Panel, Textarea } from "@/src/components/ui/app";

type Dados = {
  projeto: {
    id: string;
    nome: string;
    descricao: string;
    solucao: string | null;
    tecnologias: string[];
    links: { tipo: string; url: string }[];
    arquivos: { nome: string; url: string }[];
  };
  equipe: { nome: string; integrantes: { id: string; nome: string }[] } | null;
  desafio: { titulo: string; descricao: string } | null;
  criterios: { id: string; nome: string; descricao: string | null; peso: number }[];
  escala: { notaMin: number; notaMax: number };
  notas: { criterioId: string; nota: number; comentario: string | null }[];
  concluida: boolean;
  podeEditar: boolean;
};

export default function AvaliacaoPage() {
  const { projetoId } = useParams<{ projetoId: string }>();
  const { data, error, loading, reload } = useApi<Dados>(`/api/jurado/avaliacao/${projetoId}`);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [comentario, setComentario] = useState("");
  const [resultado, setResultado] = useState<{ ok: boolean; erro?: unknown } | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preenche o formulário com as notas salvas
    setNotas(Object.fromEntries(data.notas.map((n) => [n.criterioId, String(n.nota)])));
    setComentario(data.notas.find((n) => n.comentario)?.comentario ?? "");
  }, [data]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setResultado(null);
    try {
      await api(`/api/jurado/avaliacao/${projetoId}`, {
        method: "POST",
        body: {
          notas: data!.criterios.map((c) => ({ criterioId: c.id, nota: Number(notas[c.id]) })),
          comentario: comentario || null,
        },
      });
      setResultado({ ok: true });
      reload();
    } catch (err) {
      setResultado({ ok: false, erro: err });
    } finally {
      setEnviando(false);
    }
  }

  if (loading && !data) return <Loading />;
  if (error) return <Alert title={error.message} />;
  if (!data) return null;

  const { projeto, escala } = data;
  const pesoTotal = data.criterios.reduce((s, c) => s + c.peso, 0);
  const preenchidas = data.criterios.filter((c) => notas[c.id] !== undefined && notas[c.id] !== "");
  const previa = preenchidas.length === data.criterios.length && pesoTotal > 0
    ? data.criterios.reduce((s, c) => s + Number(notas[c.id]) * c.peso, 0) / pesoTotal
    : null;

  return (
    <>
      <Link href="/jurado" className="font-mono text-[0.72rem] uppercase text-muted hover:text-accent">← projetos</Link>
      <PageHeader
        tag={`avaliacao/${data.equipe?.nome ?? ""}`}
        title={projeto.nome}
        actions={<Badge tone={data.concluida ? "ok" : "alerta"}>{data.concluida ? "avaliado" : "pendente"}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid content-start gap-6">
          <Panel title="Projeto">
            <p className="whitespace-pre-line text-[0.92rem] text-foreground/85">{projeto.descricao}</p>
            {projeto.solucao ? (
              <>
                <h3 className="mt-5 font-mono text-[0.7rem] uppercase text-muted">Solução</h3>
                <p className="mt-1 whitespace-pre-line text-[0.92rem] text-foreground/85">{projeto.solucao}</p>
              </>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {projeto.tecnologias.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
            <div className="mt-4 grid gap-1 text-[0.88rem]">
              {[...projeto.links.map((l) => ({ nome: l.tipo, url: l.url })), ...projeto.arquivos].map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">{l.nome} ↗</a>
              ))}
            </div>
          </Panel>
          {data.desafio ? (
            <Panel title={`Desafio: ${data.desafio.titulo}`}>
              <p className="text-[0.9rem] text-foreground/75">{data.desafio.descricao}</p>
            </Panel>
          ) : null}
          {data.equipe ? (
            <Panel title={`Equipe ${data.equipe.nome}`}>
              <p className="text-[0.9rem] text-foreground/75">{data.equipe.integrantes.map((i) => i.nome).join(", ")}</p>
            </Panel>
          ) : null}
        </div>

        <Panel title={`Notas (${escala.notaMin} a ${escala.notaMax})`}>
          <form onSubmit={enviar} className="grid gap-5">
            {data.criterios.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_110px] items-end gap-4 border-b border-foreground/8 pb-4">
                <div>
                  <p className="font-semibold">{c.nome} <span className="font-mono text-[0.72rem] text-accent">×{c.peso}</span></p>
                  {c.descricao ? <p className="mt-1 text-[0.8rem] text-muted">{c.descricao}</p> : null}
                </div>
                <Input
                  type="number"
                  step="any"
                  min={escala.notaMin}
                  max={escala.notaMax}
                  required
                  disabled={!data.podeEditar}
                  value={notas[c.id] ?? ""}
                  onChange={(e) => setNotas((n) => ({ ...n, [c.id]: e.target.value }))}
                  aria-label={`Nota para ${c.nome}`}
                />
              </div>
            ))}
            <Field label="Comentário (opcional)">
              <Textarea disabled={!data.podeEditar} value={comentario} onChange={(e) => setComentario(e.target.value)} />
            </Field>

            <div className="flex items-center justify-between border border-foreground/10 px-4 py-3">
              <span className="font-mono text-[0.72rem] uppercase text-muted">Prévia ponderada</span>
              <span className="font-display text-[1.6rem] font-semibold text-accent">{previa == null ? "—" : previa.toFixed(2)}</span>
            </div>

            {resultado?.ok ? <Alert tone="ok" title="Avaliação enviada" /> : null}
            {resultado?.erro ? <Alert title={(resultado.erro as Error).message} lines={detalhesDoErro(resultado.erro)} /> : null}
            {!data.podeEditar ? <Alert title="Avaliação bloqueada" lines={["Já enviada sem permissão de edição, ou resultados já publicados."]} /> : null}

            <Button type="submit" disabled={enviando || !data.podeEditar} className="h-12">
              {enviando ? "Enviando…" : data.concluida ? "Reenviar avaliação" : "Enviar avaliação"}
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
