import Link from "next/link";

const navegacao = [
  { label: "Sobre", href: "/sobre" },
  { label: "Desafios", href: "/desafios" },
  { label: "Agenda", href: "/agenda" },
  { label: "Como participar", href: "/#participar" },
  { label: "Regulamento", href: "/regulamento" },
  { label: "FAQ", href: "/faq" },
] as const;

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      className="shrink-0"
      fill="none"
      style={{ color: "#b6ff00", height: "14px", width: "14px" }}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-accent/18 bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-6 md:px-10 md:py-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(250px,0.68fr)_minmax(600px,1.32fr)] lg:items-center">
          <div className="min-w-0">
            <p className="font-display text-[2rem] font-semibold leading-none text-foreground">
              HACKIF{" "}
              <span className="ml-1 font-mono text-[0.88rem] text-accent">
                {"//2026"}
              </span>
            </p>
            <p className="mt-3 max-w-[360px] font-display text-[0.9rem] leading-5 text-foreground/58">
              1º Hackathon de Ciência da Computação
              <span className="block">IFPR — Campus Pinhais</span>
            </p>
          </div>

          <nav aria-label="Navegação do rodapé" className="min-w-0 lg:justify-self-center">
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 min-[360px]:grid-cols-2 md:flex md:max-w-[820px] md:flex-wrap md:justify-center md:gap-x-7 md:gap-y-3 lg:gap-x-9">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-8 items-center font-display text-[0.78rem] font-semibold uppercase text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="my-5 h-px bg-accent/35 md:my-6" />

        <div className="grid gap-4 font-display text-[0.76rem] uppercase tracking-[0.05em] text-foreground/42 lg:grid-cols-[minmax(250px,0.68fr)_minmax(600px,1.32fr)] lg:items-center">
          <p>© 2026 HACKIF · IFPR — Campus Pinhais</p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
            <a
              href="https://www.instagram.com/ifprpinhaisoficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram oficial do IFPR Campus Pinhais"
              className="inline-flex min-h-8 items-center gap-1.5 font-display text-[0.78rem] font-semibold uppercase transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              style={{ color: "#b6ff00" }}
            >
              <InstagramIcon />
              @ifprpinhaisoficial ↗
            </a>

            <div className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
              <Link
                href="/privacidade"
                className="inline-flex min-h-8 items-center transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Privacidade
              </Link>
              <span
                aria-hidden="true"
                className="hidden min-h-8 items-center text-accent/35 min-[360px]:inline-flex"
              >
                |
              </span>
              <Link
                href="/regulamento"
                className="inline-flex min-h-8 items-center transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
