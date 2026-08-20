import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navigationItems = [
  { label: "SOBRE", href: "#sobre" },
  { label: "DESAFIOS", href: "#desafios" },
  { label: "AGENDA", href: "#agenda" },
  { label: "COMO PARTICIPAR", href: "#participar" },
  { label: "RESULTADOS", href: "#resultados" },
  { label: "FAQ", href: "#faq" },
] as const;

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
            gap-7
            lg:flex
            xl:gap-9
          "
          aria-label="Navegação principal"
        >
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="
                font-sans
                text-[0.82rem]
                font-medium
                leading-none
                tracking-[0.02em]
                text-foreground/75
                transition-colors
                duration-200
                hover:text-accent
                focus-visible:text-accent
                focus-visible:outline-none
              "
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#participar"
          className="
    ml-9
    hidden
    h-[48px]
    items-center
    justify-center
    bg-accent
    px-8
    font-sans
    text-[0.82rem]
    font-bold
    leading-none
    tracking-[0.015em]
    !text-[#050706]
    transition-all
    duration-200
    hover:bg-foreground
    lg:flex
  "
        >
          INSCREVA-SE
          <span
            className="ml-2 font-mono !text-[#050706] text-[0.9rem] "
            aria-hidden="true"
          >
            ↗
          </span>
        </a>

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
            lg:ml-7
          "
          aria-label="Abrir menu de navegação"
        >
          <Menu size={30} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
