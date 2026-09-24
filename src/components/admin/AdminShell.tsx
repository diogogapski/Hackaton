"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell, type ShellUser } from "@/src/components/layout/AppShell";
import { navAdmin } from "@/src/components/layout/navegacao";
import { HackathonProvider, HackathonSelector, useHackathon } from "@/src/components/admin/HackathonContext";

/** Telas que funcionam sem nenhuma edição cadastrada. */
const SEM_EDICAO = ["/admin/hackathons", "/admin/usuarios", "/admin/equipes", "/admin/jurados"];

/** Banco novo, sem edição: em vez de erros "Hackathon não encontrado", guia a criação da primeira. */
function ExigeEdicao({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { hackathons, carregado } = useHackathon();

  if (!carregado || hackathons.length > 0 || SEM_EDICAO.some((p) => pathname.startsWith(p))) return <>{children}</>;

  return (
    <section className="mx-auto max-w-2xl border border-accent/30 bg-accent/[0.04] p-8 md:p-10">
      <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">{"// primeiros passos"}</p>
      <h1 className="mt-3 font-display text-[2rem] font-semibold uppercase leading-none md:text-[2.4rem]">Nenhuma edição cadastrada</h1>
      <p className="mt-4 text-muted">
        Desafios, agenda, critérios, projetos, avaliações e resultados pertencem a uma edição do hackathon. Crie a primeira
        edição com datas, local e limites de equipe; depois cadastre os critérios e desafios.
      </p>
      <ol className="mt-6 grid gap-2 font-mono text-[0.8rem] uppercase text-foreground/75">
        <li><span className="text-accent">01</span> Criar a edição (status “Inscrições abertas” para liberar inscrições)</li>
        <li><span className="text-accent">02</span> Cadastrar critérios de avaliação e desafios</li>
        <li><span className="text-accent">03</span> Montar a agenda e autorizar jurados</li>
      </ol>
      <Link
        href="/admin/hackathons"
        className="mt-8 inline-flex h-12 items-center bg-accent px-7 font-sans text-[0.82rem] font-bold uppercase !text-[#050706] transition-colors hover:bg-foreground"
      >
        Criar primeira edição
        <ArrowUpRight size={15} strokeWidth={2} className="ml-2" aria-hidden="true" />
      </Link>
    </section>
  );
}

export function AdminShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  return (
    <HackathonProvider>
      <AppShell user={user} nav={navAdmin} area="ADMIN" toolbar={<HackathonSelector />}>
        <ExigeEdicao>{children}</ExigeEdicao>
      </AppShell>
    </HackathonProvider>
  );
}
