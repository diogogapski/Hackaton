import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/layout/AppShell";

export default async function JuradoLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/jurado");
  if (user.papel !== "JURADO") redirect("/");

  return (
    <AppShell
      user={{ nome: user.nome, email: user.email, papel: user.papel }}
      area="JURADO"
      nav={[{ label: "Meus projetos", href: "/jurado" }]}
    >
      {children}
    </AppShell>
  );
}
