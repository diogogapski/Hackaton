"use client";

import { useState } from "react";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { api } from "@/src/lib/api-client";
import { Alert, Badge, Button, Empty, Input, Loading, PageHeader, Panel, Select } from "@/src/components/ui/app";

type Membro = { id: string; user: { id: string; nome: string; email: string; vinculo: string } };
type Equipe = {
  id: string;
  nome: string;
  situacao: "EM_FORMACAO" | "INSCRITA" | "DESCLASSIFICADA";
  liderId: string | null;
  codigoConvite: string | null;
  membros: Membro[];
  projeto: { id: string; nome: string; situacao: string } | null;
};
type Resposta = { equipes: Equipe[]; total: number };

const tom = { INSCRITA: "ok", EM_FORMACAO: "alerta", DESCLASSIFICADA: "erro" } as const;

export default function AdminEquipesPage() {
  const { url, hackathonId } = useHackathon();
  const [q, setQ] = useState("");
  const [situacao, setSituacao] = useState("");
  const params = new URLSearchParams({ pageSize: "100" });
  if (q) params.set("q", q);
  if (situacao) params.set("situacao", situacao);
  // A listagem de equipes aceita hackathonId opcional; sem seleção, lista todas as edições.
  const { data, error, loading, reload } = useApi<Resposta>(hackathonId ? url(`/api/admin/equipes?${params}`) : `/api/admin/equipes?${params}`);
  const [aviso, setAviso] = useState<{ tone: "ok" | "erro"; title: string } | null>(null);

  async function acao(fn: () => Promise<unknown>, sucesso: string, confirmar?: string) {
    if (confirmar && !confirm(confirmar)) return;
    try {
      await fn();
      setAviso({ tone: "ok", title: sucesso });
      reload();
    } catch (e) {
      setAviso({ tone: "erro", title: (e as Error).message });
    }
  }

  const atualizar = (e: Equipe, body: object, sucesso: string) =>
    acao(() => api(`/api/admin/equipes/${e.id}`, { method: "PUT", body }), sucesso);

  return (
    <>
      <PageHeader
        tag="admin/equipes"
        title="Equipes"
        description="Corrija situação, liderança e integrantes. Fora a desclassificação, a situação é sempre calculada pelo número de integrantes."
        actions={
          <>
            <Input className="w-56" placeholder="Buscar equipe" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar equipe" />
            <Select className="w-48" value={situacao} onChange={(e) => setSituacao(e.target.value)} aria-label="Situação">
              <option value="">Todas as situações</option>
              <option value="EM_FORMACAO">Em formação</option>
              <option value="INSCRITA">Inscrita</option>
              <option value="DESCLASSIFICADA">Desclassificada</option>
            </Select>
          </>
        }
      />
      {aviso ? <div className="mb-4"><Alert tone={aviso.tone} title={aviso.title} /></div> : null}
      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} /> : null}
      {data?.equipes.length === 0 ? <Empty>Nenhuma equipe</Empty> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {data?.equipes.map((e) => (
          <Panel
            key={e.id}
            title={e.nome}
            actions={<Badge tone={tom[e.situacao]}>{e.situacao}</Badge>}
          >
            <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.72rem] uppercase text-muted">
              <span>{e.membros.length} integrante(s)</span>
              <span>convite {e.codigoConvite ?? "—"}</span>
              <span>projeto: {e.projeto ? `${e.projeto.nome} (${e.projeto.situacao})` : "—"}</span>
            </div>

            <ul className="grid gap-2">
              {e.membros.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/8 pb-2 text-[0.88rem]">
                  <span>
                    {m.user.nome} {m.user.id === e.liderId ? <Badge tone="ok">líder</Badge> : null}
                    <span className="block text-[0.75rem] text-muted">{m.user.email} · {m.user.vinculo}</span>
                  </span>
                  <span className="flex gap-2">
                    {m.user.id !== e.liderId ? (
                      <Button variant="ghost" className="h-8 px-3" onClick={() => atualizar(e, { liderId: m.user.id }, `${m.user.nome} agora lidera ${e.nome}`)}>
                        Líder
                      </Button>
                    ) : null}
                    <Button
                      variant="danger"
                      className="h-8 px-3"
                      onClick={() => acao(
                        () => api(`/api/equipe/membro/${m.user.id}`, { method: "DELETE" }),
                        `${m.user.nome} removido de ${e.nome}`,
                        `Remover ${m.user.nome} de ${e.nome}?`,
                      )}
                    >
                      Remover
                    </Button>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {e.situacao === "DESCLASSIFICADA" ? (
                <Button variant="ghost" onClick={() => atualizar(e, { situacao: "EM_FORMACAO" }, `${e.nome} reavaliada pelo número de integrantes`)}>
                  Reverter desclassificação
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => acao(
                    () => api(`/api/admin/equipes/${e.id}`, { method: "PUT", body: { situacao: "DESCLASSIFICADA" } }),
                    `${e.nome} desclassificada`,
                    `Desclassificar ${e.nome}?`,
                  )}
                >
                  Desclassificar
                </Button>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
