"use client";

import Link from "next/link";
import { useState } from "react";
import { tomSituacaoEquipe, useEquipe } from "@/src/components/participante/useEquipe";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Badge, Empty, formatarData, Loading, PageHeader, Panel, Stat } from "@/src/components/ui/app";

type Hackathon = {
  nome: string;
  status: string;
  local: string | null;
  dataInicio: string;
  dataFim: string;
  inscricaoFim: string | null;
  prazoSubmissao: string | null;
  inscricoesAbertas: boolean;
  submissaoAberta: boolean;
  resultadosPublicados: boolean;
};
type Projeto = { nome: string; situacao: "RASCUNHO" | "ENVIADO" | "DESCLASSIFICADO"; enviadoEm: string | null };
type AgendaItem = { id: string; titulo: string; horarioInicio: string; local: string | null; cancelado: boolean };
type Comunicado = { id: string; titulo: string; conteudo: string; publicadoEm: string };

const atalho = "inline-flex h-10 items-center justify-center border border-foreground/20 px-4 text-[0.78rem] font-bold uppercase hover:border-accent hover:text-accent";

/** Dashboard do participante (planejamento, página 12). */
export default function DashboardPage() {
  const { equipe, h: hEquipe, carregando } = useEquipe();
  const hackathon = useApi<{ hackathon: Hackathon }>("/api/hackathon/atual");
  const projeto = useApi<{ projeto: Projeto | null }>(equipe ? "/api/projeto" : null);
  const agenda = useApi<{ agenda: AgendaItem[] }>("/api/agenda");
  const comunicados = useApi<{ comunicados: Comunicado[] }>("/api/comunicados");

  const h = hackathon.data?.hackathon;
  const [agora] = useState(() => Date.now());
  const proximo = agenda.data?.agenda.find((a) => !a.cancelado && new Date(a.horarioInicio).getTime() >= agora) ?? null;
  const p = projeto.data?.projeto ?? null;

  // Próximo passo sugerido conforme a situação da inscrição.
  const passo = !equipe
    ? { texto: "Crie uma equipe ou entre em uma com o código de convite.", href: "/equipe", rotulo: "Montar equipe" }
    : hEquipe && equipe.membros.length < hEquipe.limiteMinIntegrantes
      ? { texto: `Convide mais ${hEquipe.limiteMinIntegrantes - equipe.membros.length} integrante(s) para a inscrição ser confirmada.`, href: "/equipe/gerenciar", rotulo: "Convidar" }
      : !p || p.situacao === "RASCUNHO"
        ? { texto: "Cadastre e envie o projeto da equipe antes do prazo.", href: "/projeto", rotulo: "Enviar projeto" }
        : h?.resultadosPublicados
          ? { texto: "Os resultados foram publicados.", href: "/resultados", rotulo: "Ver resultados" }
          : { texto: "Projeto enviado. Acompanhe a agenda e os comunicados.", href: "/agenda", rotulo: "Ver agenda" };

  return (
    <>
      <PageHeader
        tag="dashboard"
        title={h?.nome ?? "Dashboard"}
        description={h ? `${formatarData(h.dataInicio)} → ${formatarData(h.dataFim)}${h.local ? ` · ${h.local}` : ""}` : undefined}
        actions={h ? <Badge tone="ok">{h.status.replace("_", " ")}</Badge> : null}
      />

      {hackathon.loading && !hackathon.data ? <Loading /> : null}
      {hackathon.error ? <Alert title={hackathon.error.message} /> : null}

      {h && !carregando ? (
        <div className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-accent bg-accent/10 px-5 py-4">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-accent">Próximo passo</p>
              <p className="mt-1 text-[1rem]">{passo.texto}</p>
            </div>
            <Link href={passo.href} className="inline-flex h-10 items-center bg-accent px-5 text-[0.8rem] font-bold uppercase !text-[#050706] hover:bg-foreground">{passo.rotulo} ↗</Link>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Inscrição"
              value={equipe ? <Badge tone={tomSituacaoEquipe[equipe.situacao as keyof typeof tomSituacaoEquipe] ?? "neutro"}>{equipe.situacao}</Badge> : "—"}
              sub={equipe ? equipe.nome : "sem equipe"}
            />
            <Stat
              label="Equipe"
              value={equipe ? `${equipe.membros.length}/${hEquipe?.limiteMaxIntegrantes ?? "?"}` : "0"}
              sub={hEquipe ? `mínimo ${hEquipe.limiteMinIntegrantes}` : undefined}
            />
            <Stat
              label="Projeto"
              value={p ? <Badge tone={p.situacao === "ENVIADO" ? "ok" : p.situacao === "DESCLASSIFICADO" ? "erro" : "alerta"}>{p.situacao}</Badge> : "—"}
              sub={h.submissaoAberta ? `prazo ${formatarData(h.prazoSubmissao ?? h.dataFim)}` : "submissão fechada"}
            />
            <Stat
              label="Próximo compromisso"
              value={<span className="text-[1.1rem]">{proximo ? proximo.titulo : "—"}</span>}
              sub={proximo ? `${formatarData(proximo.horarioInicio)}${proximo.local ? ` · ${proximo.local}` : ""}` : "sem atividades futuras"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Panel title="Comunicados" actions={<Link href="/agenda" className="font-mono text-[0.72rem] uppercase text-accent hover:underline">agenda completa →</Link>}>
              {comunicados.data?.comunicados.length === 0 ? <Empty>Nenhum comunicado</Empty> : null}
              <div className="grid gap-4">
                {comunicados.data?.comunicados.slice(0, 4).map((c) => (
                  <article key={c.id} className="border-l-2 border-accent pl-4">
                    <p className="font-mono text-[0.7rem] uppercase text-muted">{formatarData(c.publicadoEm)}</p>
                    <h3 className="mt-1 font-semibold">{c.titulo}</h3>
                    <p className="mt-1 line-clamp-3 whitespace-pre-line text-[0.9rem] text-foreground/75">{c.conteudo}</p>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel title="Atalhos">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/equipe" className={atalho}>Minha equipe</Link>
                <Link href="/projeto" className={atalho}>Projeto</Link>
                <Link href="/desafios" className={atalho}>Desafios</Link>
                <Link href="/agenda" className={atalho}>Agenda</Link>
                <Link href="/regulamento" className={atalho}>Regulamento</Link>
                <Link href="/perfil" className={atalho}>Meu perfil</Link>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}
