const footerNavigation = [
  { label: "Sobre", href: "#sobre" },
  { label: "Desafios", href: "#desafios" },
  { label: "Agenda", href: "#agenda" },
  { label: "Como Participar", href: "#participar" },
  { label: "Resultados", href: "#resultados" },
  { label: "FAQ", href: "#faq" },
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
          <nav aria-label="Navegação do rodapé" className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 md:justify-self-end">
            {footerNavigation.map((item) => (
              <a key={item.href} href={item.href} className="font-display text-[0.82rem] font-semibold uppercase text-foreground/62 transition-colors hover:text-accent">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-foreground/10 pt-6 font-display text-[0.78rem] uppercase tracking-[0.05em] text-foreground/42 md:flex-row md:items-center md:justify-between">
          <p>© 2026 HACKIF</p>
          <p>IFPR — Campus Pinhais</p>
        </div>
      </div>
    </footer>
  );
}
