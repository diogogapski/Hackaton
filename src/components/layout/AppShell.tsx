"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/src/lib/api-client";

export type ShellUser = { nome: string; email: string; papel: "PARTICIPANTE" | "JURADO" | "ADMIN" };
type NavItem = { label: string; href: string };

export function AppShell({ user, nav, area, children, toolbar }: {
  user: ShellUser;
  nav: NavItem[];
  area: string;
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function sair() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-accent/20">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-6 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-2" aria-label="HACKIF - Página inicial">
            <span className="font-display text-[1.6rem] font-semibold leading-none tracking-[-0.03em]">HACK</span>
            <Image src="/images/IFNeon.png" alt="" width={30} height={26} className="h-[24px] w-auto" aria-hidden="true" />
            <span className="ml-2 font-mono text-[0.72rem] font-semibold uppercase text-accent">{`//${area}`}</span>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            {toolbar}
            <div className="hidden text-right sm:block">
              <p className="text-[0.85rem] font-semibold leading-tight">{user.nome}</p>
              <p className="font-mono text-[0.68rem] uppercase text-muted">{user.papel}</p>
            </div>
            <button
              type="button"
              onClick={sair}
              className="flex h-9 w-9 cursor-pointer items-center justify-center border border-foreground/15 bg-transparent text-foreground/70 hover:border-accent hover:text-accent"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-6 md:px-10" aria-label={`Navegação ${area}`}>
          {nav.map((item) => {
            const ativo = item.href === pathname || (item.href !== nav[0].href && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap border-b-2 px-3 py-3 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.04em] transition-colors ${
                  ativo ? "border-accent text-accent" : "border-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-10 md:px-10">{children}</main>
    </div>
  );
}
