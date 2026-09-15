import Link from "next/link";

const colunas = [
  {
    titulo: "Evento",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "O Hackathon", href: "/hackathon" },
      { label: "Desafios", href: "/desafios" },
      { label: "Agenda", href: "/agenda" },
      { label: "Resultados", href: "/resultados" },
    ],
  },
  {
    titulo: "Participe",
    links: [
      { label: "Como Participar", href: "/#participar" },
      { label: "Inscreva-se", href: "/cadastro" },
      { label: "Regulamento", href: "/regulamento" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    titulo: "Acesso",
    links: [
      { label: "Entrar", href: "/login" },
      { label: "Área do jurado", href: "/login/servidor?next=/jurado" },
      { label: "Área administrativa", href: "/login/servidor?next=/admin" },
      { label: "Esqueci minha senha", href: "/recuperar-senha" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-accent/18 bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10">
        <div className="grid gap-10 md:grid-cols-[0.42fr_0.58fr] md:items-start">
          <div>
            <p className="font-display text-[2rem] font-semibold leading-none text-foreground">
              HACKIF{" "}
              <span className="font-mono text-[0.82rem] text-accent">
                {"//2026"}
              </span>
            </p>
            <p className="mt-5 max-w-[360px] font-display text-[0.95rem] leading-6 text-foreground/58">
              1º Hackathon de Ciência da Computação
              <span className="block">IFPR — Campus Pinhais</span>
            </p>
          </div>
          <nav aria-label="Navegação do rodapé" className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 md:justify-self-end">
            {colunas.map((coluna) => (
              <div key={coluna.titulo}>
                <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-accent">{`// ${coluna.titulo}`}</p>
                <ul className="mt-4 grid gap-3">
                  {coluna.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="font-display text-[0.82rem] font-semibold uppercase text-foreground/62 transition-colors hover:text-accent">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-foreground/10 pt-6 font-display text-[0.78rem] uppercase tracking-[0.05em] text-foreground/42 md:flex-row md:items-center md:justify-between">
          <p>© 2026 HACKIF · IFPR — Campus Pinhais</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacidade" className="transition-colors hover:text-accent">Privacidade</Link>
            <Link href="/login/servidor?next=/admin" className="transition-colors hover:text-accent">Acesso administrativo ↗</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
