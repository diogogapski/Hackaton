import Link from "next/link";

const links = [
  { label: "O Hackathon", href: "/hackathon" },
  { label: "Desafios", href: "/desafios" },
  { label: "Agenda", href: "/agenda" },
  { label: "Resultados", href: "/resultados" },
  { label: "Regulamento", href: "/regulamento" },
];

/**
 * Navegação das páginas do sistema (abaixo do Header original do Dev Front, que não é alterado):
 * páginas públicas do planejamento e acesso a login e cadastro. Não aparece na Home.
 */
export function BarraSistema() {
  return (
    <div className="border-b border-foreground/10 bg-background">
      <div className="mx-auto flex max-w-[1440px] items-center gap-1 overflow-x-auto px-6 md:px-10">
        <span className="mr-3 hidden shrink-0 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-accent sm:inline">{"// sistema"}</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="shrink-0 px-3 py-3 font-sans text-[0.76rem] font-semibold uppercase tracking-[0.04em] text-foreground/60 transition-colors hover:text-accent"
          >
            {l.label}
          </Link>
        ))}
        <span className="ml-auto flex shrink-0 items-center gap-2 py-2 pl-4">
          <Link href="/login" className="border border-accent/40 px-4 py-1.5 font-sans text-[0.74rem] font-bold uppercase text-foreground transition-colors hover:border-accent hover:text-accent">
            Entrar
          </Link>
          <Link href="/cadastro/aluno" className="bg-accent px-4 py-1.5 font-sans text-[0.74rem] font-bold uppercase !text-[#050706] transition-colors hover:bg-foreground">
            Criar conta
          </Link>
        </span>
      </div>
    </div>
  );
}
