"use client";

import type { ReactNode } from "react";
import { AppShell, type ShellUser } from "@/src/components/layout/AppShell";
import { HackathonProvider, HackathonSelector } from "@/src/components/admin/HackathonContext";

const nav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Edições", href: "/admin/edicoes" },
  { label: "Desafios", href: "/admin/desafios" },
  { label: "Agenda", href: "/admin/agenda" },
  { label: "Critérios", href: "/admin/criterios" },
  { label: "Projetos", href: "/admin/projetos" },
  { label: "Jurados", href: "/admin/jurados" },
  { label: "Avaliações", href: "/admin/avaliacoes" },
  { label: "Resultados", href: "/admin/resultados" },
  { label: "Comunicados", href: "/admin/comunicados" },
];

export function AdminShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  return (
    <HackathonProvider>
      <AppShell user={user} nav={nav} area="ADMIN" toolbar={<HackathonSelector />}>
        {children}
      </AppShell>
    </HackathonProvider>
  );
}
