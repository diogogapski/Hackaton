import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { AgendaHome } from "./types";

const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export function AgendaPreviewSection({ agenda }: { agenda: AgendaHome[] }) {
  return (
    <section id="agenda" className="border-t border-foreground/10 bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 md:px-10 lg:grid-cols-[1fr_320px] lg:gap-20">
        <div>
          <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
            <span className="text-accent">04 //</span> AGENDA
          </p>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(2.25rem,5vw,5.4rem)] font-semibold uppercase leading-[0.98] tracking-0">
              <span className="block text-foreground">O QUE VEM</span>
              <span className="block text-accent">A SEGUIR._</span>
            </h2>
            <Link href="/agenda" className="inline-flex items-center gap-2 font-display text-[0.82rem] font-semibold uppercase text-accent hover:text-foreground">
              Agenda completa <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>

          {agenda.length ? (
            <ol className="mt-12 border-y border-foreground/12">
              {agenda.map((item, indice) => (
                <li key={item.id} className="grid gap-3 border-b border-foreground/10 py-5 last:border-b-0 md:grid-cols-[48px_220px_1fr_auto] md:items-center">
                  <span className="font-mono text-[0.75rem] text-accent">{String(indice + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-[0.78rem] uppercase text-foreground/60">{dataHora(item.horarioInicio)}</span>
                  <strong className="font-display text-[1rem] uppercase">{item.titulo}</strong>
                  <span className="flex items-center gap-2 text-[0.82rem] text-foreground/55">
                    {item.local ? <><MapPin size={15} aria-hidden="true" />{item.local}</> : "Local a definir"}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-12 border-y border-foreground/12 py-8 text-foreground/55">A programação será publicada em breve.</p>
          )}
        </div>

        <aside id="faq" className="border-l border-accent/24 pl-6 lg:mt-24 lg:pl-8">
          <CalendarDays size={30} className="text-accent" aria-hidden="true" />
          <h3 className="mt-6 font-display text-[1.35rem] font-semibold uppercase">Antes de participar</h3>
          <p className="mt-3 text-[0.92rem] leading-6 text-foreground/60">Consulte as regras, os critérios da edição e as respostas para as dúvidas mais comuns.</p>
          <div className="mt-7 grid gap-3">
            <Link href="/regulamento" className="flex items-center justify-between border-b border-foreground/12 py-3 font-display text-[0.82rem] font-semibold uppercase hover:text-accent">
              Regulamento <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/faq" className="flex items-center justify-between border-b border-foreground/12 py-3 font-display text-[0.82rem] font-semibold uppercase hover:text-accent">
              Perguntas frequentes <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/hackathon" className="flex items-center justify-between border-b border-foreground/12 py-3 font-display text-[0.82rem] font-semibold uppercase hover:text-accent">
              Detalhes da edição <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
