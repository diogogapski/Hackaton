import Link from "next/link";
import { GraduationCap, Briefcase, UserRound } from "lucide-react";
import { AuthLayout, AuthLinks } from "@/src/components/layout/AuthLayout";
import { LoginForm } from "@/src/components/auth/LoginForm";

const opcoes = [
  { href: "/login/aluno", titulo: "Aluno", descricao: "Matrícula + senha", icone: GraduationCap },
  { href: "/login/servidor", titulo: "Servidor / Professor", descricao: "SIAPE + senha", icone: Briefcase },
  { href: "/login/externo", titulo: "Egresso / Jurado / Convidado externo", descricao: "CPF ou e-mail + senha", icone: UserRound },
];

/** Portal de acesso (planejamento, página 6): pergunta como a pessoa deseja acessar. */
export default function LoginPortalPage() {
  return (
    <AuthLayout
      tag="acesso"
      title="Entrar no"
      highlight="HACKIF"
      description="Escolha como você participa do evento. Participantes montam a equipe e enviam o projeto, jurados avaliam e a organização acompanha tudo pelo painel."
    >
      <p className="mb-4 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-foreground/60">Como deseja acessar?</p>
      <div className="grid gap-3">
        {opcoes.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            className="group flex items-center gap-4 border border-foreground/12 p-4 transition-colors hover:border-accent"
          >
            <o.icone size={26} strokeWidth={1.5} className="shrink-0 text-accent" aria-hidden="true" />
            <span className="flex-1">
              <span className="block font-display text-[1.05rem] font-semibold uppercase group-hover:text-accent">{o.titulo}</span>
              <span className="block text-[0.82rem] text-muted">{o.descricao}</span>
            </span>
            <span className="font-mono text-accent" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>

      <details className="mt-6 border-t border-foreground/10 pt-4">
        <summary className="cursor-pointer font-mono text-[0.72rem] uppercase text-muted hover:text-accent">Entrar com e-mail</summary>
        <div className="mt-4"><LoginForm /></div>
      </details>

      <AuthLinks links={[
        { href: "/cadastro", label: "Criar conta" },
        { href: "/recuperar-senha", label: "Esqueci a senha" },
        { href: "/hackathon", label: "Ver edição" },
      ]} />
    </AuthLayout>
  );
}
