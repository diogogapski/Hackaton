import { redirect } from "next/navigation";

/** Endereços antigos por vínculo (/login/aluno, /login/servidor, /login/externo) usam o login único. */
export default async function LoginVinculoPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
}
