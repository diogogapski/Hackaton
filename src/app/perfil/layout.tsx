import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/layout/AppShell";
import { navPorPapel } from "@/src/components/layout/navegacao";

export default async function PerfilLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/perfil");

  return (
    <AppShell user={{ nome: user.nome, email: user.email, papel: user.papel }} area="PERFIL" nav={[...navPorPapel[user.papel]]}>
      {children}
    </AppShell>
  );
}
