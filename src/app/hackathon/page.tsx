"use client";

import Link from "next/link";
import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Badge, Empty, formatarData, Loading } from "@/src/components/ui/app";

type Hackathon = {
  nome: string;
  descricao: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  inscricaoFim: string | null;
  limiteMinIntegrantes: number;
  limiteMaxIntegrantes: number;
  regulamentoUrl: string | null;
  inscricoesAbertas: boolean;
  submissaoAberta: boolean;
};

const ROTULO_STATUS: Record<string, string> = {
  INSCRICOES_ABERTAS: "inscrições abertas",
  EM_ANDAMENTO: "em andamento",
  ENCERRADO: "encerrado",
};

function Secao({ id, tag, titulo, children }: { id: string; tag: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-foreground/10 py-14">
      <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">{`// ${tag}`}</p>
      <h2 className="mb-8 mt-2 font-display text-[2rem] font-semibold uppercase leading-none">{titulo}</h2>
      {children}
    </section>
  );
}

export default function HackathonPage() {
  const h = useApi<{ hackathon: Hackathon }>("/api/hackathon/atual");
  const desafios = useApi<{ desafios: { id: string; titulo: string; descricao: string; categoria: string | null }[] }>("/api/desafios");
  const agenda = useApi<{ agenda: { id: string; titulo: string; horarioInicio: string; horarioFim: string | null; local: string | null }[] }>("/api/agenda");
  const comunicados = useApi<{ comunicados: { id: string; titulo: string; conteudo: string; publicadoEm: string }[] }>("/api/comunicados");
  const hackathon = h.data?.hackathon;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1440px] px-6 md:px-10">
        {h.loading && !h.data ? <div className="py-16"><Loading /></div> : null}
        {h.error ? <div className="py-16"><Alert title={h.error.message} /></div> : null}

        {hackathon ? (
          <>
            <section className="grid gap-10 py-16 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="ok">{ROTULO_STATUS[hackathon.status] ?? hackathon.status}</Badge>
                  {hackathon.status !== "INSCRICOES_ABERTAS" && hackathon.inscricoesAbertas ? <Badge tone="ok">inscrições abertas</Badge> : null}
                </div>
                <h1 className="mt-5 font-display text-[2.6rem] font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-[3.6rem]">{hackathon.nome}</h1>
                <p className="mt-5 max-w-2xl whitespace-pre-line text-[1.05rem] text-foreground/75">{hackathon.descricao}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/entrar" className="inline-flex h-12 items-center bg-accent px-7 text-[0.82rem] font-bold uppercase !text-[#050706] hover:bg-foreground">Área do participante ↗</Link>
                  {hackathon.regulamentoUrl ? (
                    <a href={hackathon.regulamentoUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center border border-foreground/20 px-7 text-[0.82rem] font-bold uppercase hover:border-accent hover:text-accent">Regulamento</a>
                  ) : null}
                </div>
              </div>
              <dl className="grid content-start gap-px border border-foreground/10 bg-foreground/10">
                {[
                  ["Evento", `${formatarData(hackathon.dataInicio)} → ${formatarData(hackathon.dataFim)}`],
                  ["Inscrições até", formatarData(hackathon.inscricaoFim)],
                  ["Equipes", `${hackathon.limiteMinIntegrantes} a ${hackathon.limiteMaxIntegrantes} integrantes`],
                  ["Submissão", hackathon.submissaoAberta ? "aberta" : "fechada"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-background p-4">
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">{k}</dt>
                    <dd className="mt-1 text-[0.95rem]">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <Secao id="desafios" tag="desafios" titulo="Desafios">
              {desafios.data?.desafios.length === 0 ? <Empty>Desafios ainda não publicados</Empty> : null}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {desafios.data?.desafios.map((d, i) => (
                  <article key={d.id} className="border border-foreground/10 p-6">
                    <div className="flex items-center justify-between font-mono text-[0.72rem] uppercase text-muted">
                      <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span>{d.categoria}</span>
                    </div>
                    <h3 className="mt-4 font-display text-[1.4rem] font-semibold uppercase leading-tight">{d.titulo}</h3>
                    <p className="mt-3 whitespace-pre-line text-[0.92rem] text-foreground/70">{d.descricao}</p>
                  </article>
                ))}
              </div>
            </Secao>

            <Secao id="agenda" tag="agenda" titulo="Agenda">
              {agenda.data?.agenda.length === 0 ? <Empty>Agenda em breve</Empty> : null}
              <ol className="grid gap-px border border-foreground/10 bg-foreground/10">
                {agenda.data?.agenda.map((a) => (
                  <li key={a.id} className="grid gap-2 bg-background p-4 md:grid-cols-[240px_1fr_200px]">
                    <span className="font-mono text-[0.85rem] text-accent">{formatarData(a.horarioInicio)}</span>
                    <span className="font-semibold">{a.titulo}</span>
                    <span className="text-[0.85rem] text-muted md:text-right">{a.local ?? ""}</span>
                  </li>
                ))}
              </ol>
            </Secao>

            <Secao id="comunicados" tag="comunicados" titulo="Comunicados">
              {comunicados.data?.comunicados.length === 0 ? <Empty>Nenhum comunicado</Empty> : null}
              <div className="grid gap-4">
                {comunicados.data?.comunicados.map((c) => (
                  <article key={c.id} className="border-l-2 border-accent pl-5">
                    <p className="font-mono text-[0.72rem] uppercase text-muted">{formatarData(c.publicadoEm)}</p>
                    <h3 className="mt-1 text-[1.1rem] font-semibold">{c.titulo}</h3>
                    <p className="mt-2 whitespace-pre-line text-[0.92rem] text-foreground/75">{c.conteudo}</p>
                  </article>
                ))}
              </div>
            </Secao>
          </>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
