"use client";

import { useEffect } from "react";
import { PaginaPublica } from "@/src/components/publico/PaginaPublica";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Badge, Empty, formatarData, Loading } from "@/src/components/ui/app";

type Item = {
  id: string;
  titulo: string;
  horarioInicio: string;
  horarioFim: string | null;
  local: string | null;
  observacoes: string | null;
  cancelado: boolean;
  atualizadoEm: string;
};
type Comunicado = { id: string; titulo: string; conteudo: string; publicadoEm: string };

const ATUALIZAR_A_CADA_MS = 60_000;
const dia = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/**
 * Cronograma oficial (planejamento, página 4): horário, atividade, local e comunicados.
 * Recarrega sozinho a cada minuto para que mudanças da organização cheguem sem precisar atualizar a página.
 */
export default function AgendaPage() {
  const agenda = useApi<{ agenda: Item[] }>("/api/agenda");
  const comunicados = useApi<{ comunicados: Comunicado[] }>("/api/comunicados");
  const { reload: recarregarAgenda } = agenda;
  const { reload: recarregarComunicados } = comunicados;

  useEffect(() => {
    const id = setInterval(() => {
      recarregarAgenda();
      recarregarComunicados();
    }, ATUALIZAR_A_CADA_MS);
    return () => clearInterval(id);
  }, [recarregarAgenda, recarregarComunicados]);

  const porDia = new Map<string, Item[]>();
  for (const item of agenda.data?.agenda ?? []) {
    const chave = dia(item.horarioInicio);
    porDia.set(chave, [...(porDia.get(chave) ?? []), item]);
  }

  return (
    <PaginaPublica tag="agenda" titulo="Agenda" descricao="Programação oficial do evento. Esta página se atualiza sozinha: mudanças de horário ou sala aparecem aqui primeiro.">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {agenda.loading && !agenda.data ? <Loading /> : null}
          {agenda.error ? <Alert title={agenda.error.message} /> : null}
          {agenda.data?.agenda.length === 0 ? <Empty>Agenda em breve</Empty> : null}
          <div className="grid gap-8">
            {[...porDia.entries()].map(([nomeDia, itens]) => (
              <section key={nomeDia}>
                <h2 className="mb-3 font-display text-[1rem] font-semibold uppercase tracking-[0.06em] text-accent">{nomeDia}</h2>
                <ol className="grid gap-px border border-foreground/10 bg-foreground/10">
                  {itens.map((a) => (
                    <li key={a.id} className={`grid gap-2 bg-background p-4 md:grid-cols-[130px_1fr_auto] ${a.cancelado ? "opacity-60" : ""}`}>
                      <span className="font-mono text-[0.95rem] text-accent">
                        {hora(a.horarioInicio)}{a.horarioFim ? `–${hora(a.horarioFim)}` : ""}
                      </span>
                      <span>
                        <span className={`font-semibold ${a.cancelado ? "line-through" : ""}`}>{a.titulo}</span>
                        {a.cancelado ? <span className="ml-2"><Badge tone="erro">cancelado</Badge></span> : null}
                        {a.observacoes ? <span className="mt-1 block text-[0.85rem] text-muted">{a.observacoes}</span> : null}
                      </span>
                      <span className="text-[0.85rem] text-foreground/70 md:text-right">{a.local ?? ""}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>

        <aside>
          <h2 className="mb-3 font-display text-[1rem] font-semibold uppercase tracking-[0.06em]">Comunicados</h2>
          {comunicados.data?.comunicados.length === 0 ? <Empty>Nenhum comunicado</Empty> : null}
          <div className="grid gap-5">
            {comunicados.data?.comunicados.map((c) => (
              <article key={c.id} className="border-l-2 border-accent pl-4">
                <p className="font-mono text-[0.7rem] uppercase text-muted">{formatarData(c.publicadoEm)}</p>
                <h3 className="mt-1 font-semibold">{c.titulo}</h3>
                <p className="mt-1 whitespace-pre-line text-[0.9rem] text-foreground/75">{c.conteudo}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </PaginaPublica>
  );
}
