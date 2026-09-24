import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function PurposeSection() {
  return (
    <section className="bg-background py-28 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <p className="font-display text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-foreground/55">
          <span className="text-accent">07 //</span> PROPÓSITO
        </p>
        <div className="mt-16 max-w-[1080px]">
          <p className="font-display text-[clamp(2.6rem,7vw,8rem)] font-semibold uppercase leading-[0.96] tracking-0 text-foreground">
            PROBLEMAS EXISTEM.
            <span className="block">IDEIAS TAMBÉM.</span>
            <span className="mt-10 block text-accent">
              O QUE ACONTECE QUANDO COLOCAMOS OS DOIS JUNTOS?_
            </span>
          </p>
        </div>
        <div className="mt-14 flex flex-col gap-8 border-t border-foreground/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-[1rem] font-semibold uppercase leading-6 text-foreground">
            <span className="block text-accent">HACKIF //</span>
            CONSTRUA A RESPOSTA.
          </p>
          <Link href="/como-participar" className="inline-flex min-h-14 items-center bg-accent px-8 font-display text-[0.9rem] font-semibold uppercase text-background transition-colors hover:bg-foreground">
            PARTICIPAR DO HACKIF
            <ArrowUpRight size={15} strokeWidth={2} className="ml-2" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
