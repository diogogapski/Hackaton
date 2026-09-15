"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigationItems = [
  { label: "SOBRE", href: "/sobre" },
  { label: "DESAFIOS", href: "/desafios" },
  { label: "AGENDA", href: "/agenda" },
  { label: "COMO PARTICIPAR", href: "/#participar" },
  { label: "RESULTADOS", href: "/resultados" },
  { label: "REGULAMENTO", href: "/regulamento" },
  { label: "FAQ", href: "/faq" },
] as const;

type Papel = "ADMIN" | "JURADO" | "PARTICIPANTE";
const areaPorPapel: Record<Papel, string> = { ADMIN: "/admin", JURADO: "/jurado", PARTICIPANTE: "/dashboard" };

/** Quem está logado (para trocar "Inscreva-se" por "Minha área"). Falha silenciosa: mostra o estado deslogado. */
function useSessao() {
  const [papel, setPapel] = useState<Papel | null>(null);
  useEffect(() => {
    let ativo = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { user?: { papel: Papel } | null } | null) => {
        if (ativo) setPapel(j?.user?.papel ?? null);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);
  return papel;
}

function HeaderBrand() {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-4"
      aria-label="HACKIF 2026 - Página inicial"
    >
      <div className="flex items-center gap-2">
        <span
          className="
            font-display
            text-[2.2rem]
            font-semibold
            leading-none
            tracking-[-0.03em]
            text-foreground
            transition-colors
            duration-200
            group-hover:text-accent
          "
        >
          HACK
        </span>

        <Image
          src="/images/IFNeon.png"
          alt=""
          width={42}
          height={36}
          priority
          aria-hidden="true"
          className="h-[34px] w-auto object-contain"
        />
      </div>

      <span
        className="
    font-mono
    text-[0.78rem]
    font-semibold
    leading-none
    text-accent
  "
      >
        {"//2026"}
      </span>
    </Link>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const papel = useSessao();

  const cta = papel
    ? { label: "MINHA ÁREA", href: areaPorPapel[papel] }
    : { label: "INSCREVA-SE", href: "/cadastro" };

  const ativo = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header
      className="
        relative
        z-50
        h-[92px]
        w-full
        border-b
        border-accent/20
        bg-background
      "
    >
      <div
        className="
          mx-auto
          flex
          h-full
          max-w-[1440px]
          items-center
          px-6
          md:px-10
        "
      >
        {/* MARCA */}
        <HeaderBrand />

        {/* NAVEGAÇÃO */}
        <nav
          className="
            ml-auto
            hidden
            items-center
            gap-6
            min-[1280px]:flex
            xl:gap-8
          "
          aria-label="Navegação principal"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item.href) ? "page" : undefined}
              className={`
                font-sans
                text-[0.82rem]
                font-medium
                leading-none
                tracking-[0.02em]
                transition-colors
                duration-200
                hover:text-accent
                focus-visible:text-accent
                focus-visible:outline-none
                ${ativo(item.href) ? "text-accent" : "text-foreground/75"}
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {papel ? null : (
          <Link
            href="/login"
            className="ml-8 hidden font-sans text-[0.82rem] font-bold leading-none tracking-[0.02em] text-foreground transition-colors hover:text-accent min-[1280px]:block"
          >
            ENTRAR
          </Link>
        )}

        <Link
          href={cta.href}
          className="
    ml-6
    hidden
    h-[48px]
    items-center
    justify-center
    bg-accent
    px-7
    font-sans
    text-[0.82rem]
    font-bold
    leading-none
    tracking-[0.015em]
    !text-[#050706]
    transition-all
    duration-200
    hover:bg-foreground
    min-[1280px]:flex
  "
        >
          {cta.label}
          <span
            className="ml-2 font-mono !text-[#050706] text-[0.9rem] "
            aria-hidden="true"
          >
            ↗
          </span>
        </Link>

        {/* MENU HAMBÚRGUER */}
        <button
          type="button"
          className="
            ml-auto
            flex
            h-11
            w-11
            items-center
            justify-end
            border-0
            bg-transparent
            p-0
            text-accent
            transition-all
            duration-200
            hover:text-foreground
            focus-visible:outline-none
            min-[1280px]:hidden
          "
          aria-label={
            isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? (
            <X size={30} strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <Menu size={30} strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-[92px] max-h-[calc(100vh-92px)] overflow-y-auto border-b border-accent/20 bg-background min-[1280px]:hidden"
        >
          <nav
            className="mx-auto max-w-[1440px] px-6 py-8 md:px-10"
            aria-label="Navegação responsiva"
          >
            <div className="grid gap-5 border-l border-accent/18 pl-5">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-display text-[1.25rem] font-semibold uppercase leading-none transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none ${ativo(item.href) ? "text-accent" : "text-foreground"}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={cta.href}
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-[48px] items-center justify-center bg-accent px-8 font-display text-[0.82rem] font-bold leading-none tracking-[0.015em] !text-[#050706] transition-all duration-200 hover:bg-foreground"
              >
                {cta.label}
                <span
                  className="ml-2 font-mono !text-[#050706] text-[0.9rem]"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>
              {papel ? null : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-[48px] items-center justify-center border border-accent/40 px-8 font-display text-[0.82rem] font-bold leading-none text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  ENTRAR
                </Link>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-foreground/10 pt-5 font-display text-[0.72rem] uppercase tracking-[0.08em] text-foreground/35">
              <span>HACKIF.SYSTEM</span>
              <span>NAV_MODULE</span>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
