"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input, Panel } from "@/src/components/ui/app";

/** Para quem ainda não tem equipe: criar (vira líder) ou entrar com o código de convite. */
export function SemEquipe({ aoEntrar, limites }: { aoEntrar: () => void; limites?: { min: number; max: number } }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<unknown>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    try {
      setErro(null);
      await api("/api/equipe/entrar", { method: "POST", body: { codigo } });
      aoEntrar();
    } catch (err) {
      setErro(err);
    }
  }

  return (
    <Panel title="Você ainda não tem equipe">
      {limites ? <p className="mb-5 text-[0.88rem] text-muted">Equipes têm de {limites.min} a {limites.max} integrantes.</p> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid content-start gap-3">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-foreground/60">Criar equipe</p>
          <p className="text-[0.88rem] text-muted">Você será o líder e receberá um código para convidar os colegas.</p>
          <Link href="/equipe/criar" className="inline-flex h-10 items-center justify-center gap-2 bg-accent px-5 text-[0.8rem] font-bold uppercase !text-[#050706] hover:bg-foreground">
            Criar equipe
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <form className="grid content-start gap-3" onSubmit={entrar}>
          <Field label="Entrar com código" hint="Peça o código ao líder">
            <Input required value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex.: HACKIF01" />
          </Field>
          <Button type="submit" variant="ghost">Entrar na equipe</Button>
        </form>
      </div>
      {erro ? <div className="mt-5"><Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /></div> : null}
    </Panel>
  );
}
