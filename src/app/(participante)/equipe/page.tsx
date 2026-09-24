"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SemEquipe } from "@/src/components/participante/SemEquipe";
import { tomSituacaoEquipe, useEquipe } from "@/src/components/participante/useEquipe";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Badge, formatarData, Loading, PageHeader, Panel, Table } from "@/src/components/ui/app";

/** Minha equipe (planejamento, página 14): integrantes, líder e situação da inscrição. */
export default function MinhaEquipePage() {
  const { equipe, h, meuId, souLider, carregado, carregando, erro, recarregar } = useEquipe();
  const projeto = useApi<{ projeto: { nome: string; situacao: string; enviadoEm: string | null } | null }>(equipe ? "/api/projeto" : null);
  const lider = equipe?.membros.find((m) => m.user.id === equipe.liderId);

  return (
    <>
      <PageHeader
        tag="equipe"
        title={equipe ? equipe.nome : "Minha equipe"}
        description={h ? `${h.nome} · equipes de ${h.limiteMinIntegrantes} a ${h.limiteMaxIntegrantes} integrantes` : undefined}
        actions={equipe ? (
          <>
            <Badge tone={tomSituacaoEquipe[equipe.situacao as keyof typeof tomSituacaoEquipe] ?? "neutro"}>{equipe.situacao}</Badge>
            <Link href="/equipe/gerenciar" className="inline-flex h-10 items-center border border-foreground/20 px-5 text-[0.8rem] font-bold uppercase hover:border-accent hover:text-accent">
              {souLider ? "Gerenciar equipe" : "Convite e saída"}
            </Link>
          </>
        ) : null}
      />

      {carregando ? <Loading /> : null}
      {erro ? <Alert title={erro.message} /> : null}

      {carregado && !equipe ? (
        <SemEquipe aoEntrar={recarregar} limites={h ? { min: h.limiteMinIntegrantes, max: h.limiteMaxIntegrantes } : undefined} />
      ) : null}

      {equipe ? (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Panel title={`Integrantes (${equipe.membros.length}/${h?.limiteMaxIntegrantes ?? "?"})`}>
            {h && equipe.membros.length < h.limiteMinIntegrantes ? (
              <div className="mb-4">
                <Alert title={`Faltam ${h.limiteMinIntegrantes - equipe.membros.length} integrante(s) para a equipe ficar INSCRITA`} />
              </div>
            ) : null}
            <Table head={["Nome", "Vínculo", "Entrou em"]}>
              {equipe.membros.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.user.nome}</strong> {m.user.id === equipe.liderId ? <Badge tone="ok">líder</Badge> : null}
                    {m.user.id === meuId ? <span className="ml-2 font-mono text-[0.7rem] text-muted">(você)</span> : null}
                  </td>
                  <td className="text-[0.85rem]">{m.user.vinculo}{m.user.curso ? ` · ${m.user.curso}` : ""}</td>
                  <td className="whitespace-nowrap text-[0.85rem]">{formatarData(m.entrouEm)}</td>
                </tr>
              ))}
            </Table>
          </Panel>

          <div className="grid min-w-0 content-start gap-6">
            <Panel title="Situação da inscrição">
              <dl className="grid gap-3 text-[0.9rem]">
                <div><dt className="font-mono text-[0.68rem] uppercase text-muted">Situação</dt><dd>{equipe.situacao}</dd></div>
                <div><dt className="font-mono text-[0.68rem] uppercase text-muted">Líder / responsável</dt><dd>{lider?.user.nome ?? "—"}</dd></div>
                <div>
                  <dt className="font-mono text-[0.68rem] uppercase text-muted">Projeto</dt>
                  <dd>
                    {projeto.data?.projeto ? `${projeto.data.projeto.nome} · ${projeto.data.projeto.situacao}` : "ainda não cadastrado"}{" "}
                    <Link href="/projeto" className="inline-flex items-center gap-1 text-accent hover:underline">
                      abrir
                      <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </dd>
                </div>
              </dl>
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}
