import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/layout/AppShell";

export default async function ParticipanteLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/participante/projeto");
  if (user.papel !== "PARTICIPANTE") redirect("/");

  return (
    <AppShell
      user={{ nome: user.nome, email: user.email, papel: user.papel }}
      area="PARTICIPANTE"
      nav={[
        { label: "Projeto", href: "/participante/projeto" },
        { label: "Edição", href: "/hackathon" },
        { label: "Resultados", href: "/resultados" },
      ]}
    >
      {children}
    </AppShell>
  );
}
