import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/src/lib/auth";
import { AdminShell } from "@/src/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.papel !== "ADMIN") redirect("/");

  return <AdminShell user={{ nome: user.nome, email: user.email, papel: user.papel }}>{children}</AdminShell>;
}
