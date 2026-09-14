import type { ReactNode } from "react";
import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { BarraSistema } from "@/src/components/publico/BarraSistema";

/** Moldura das páginas públicas (Header e Footer da Home). */
export function PaginaPublica({ tag, titulo, descricao, children }: { tag: string; titulo: string; descricao?: ReactNode; children: ReactNode }) {
  return (
    <>
      <Header />
      <BarraSistema />
      <main className="mx-auto max-w-[1440px] px-6 py-16 md:px-10">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">{`// ${tag}`}</p>
        <h1 className="mt-3 font-display text-[2.6rem] font-semibold uppercase leading-none tracking-[-0.03em] md:text-[3.6rem]">{titulo}</h1>
        {descricao ? <p className="mt-4 max-w-2xl text-muted">{descricao}</p> : null}
        <div className="mt-10">{children}</div>
      </main>
      <Footer />
    </>
  );
}
