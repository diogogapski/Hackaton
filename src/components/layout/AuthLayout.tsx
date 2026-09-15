import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";

/** Página de acesso: chamada à esquerda, formulário à direita. */
export function AuthLayout({ tag, title, highlight, description, children }: {
  tag: string;
  title: string;
  highlight: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto grid min-h-[calc(100vh-92px)] max-w-[1440px] items-center gap-12 px-6 py-12 md:px-10 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-accent">{`// ${tag}`}</p>
          <h1 className="mt-3 font-display text-[3rem] font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-[4rem]">
            {title}<br /><span className="text-accent">{highlight}</span>
          </h1>
          <p className="mt-5 max-w-md text-muted">{description}</p>
        </div>
        <div className="border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export function AuthLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <div className="mt-5 flex flex-wrap justify-between gap-3 font-mono text-[0.72rem] uppercase text-muted">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="hover:text-accent">{l.label}</Link>
      ))}
    </div>
  );
}
