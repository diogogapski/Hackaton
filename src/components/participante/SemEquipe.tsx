"use client";

import { useState } from "react";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input, Panel } from "@/src/components/ui/app";

/** Formulários para quem ainda não tem equipe: criar (vira líder) ou entrar por código. */
export function SemEquipe({ aoEntrar, limites }: { aoEntrar: () => void; limites?: { min: number; max: number } }) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<unknown>(null);

  async function acao(e: React.FormEvent, fn: () => Promise<unknown>) {
    e.preventDefault();
    try {
      setErro(null);
      await fn();
      aoEntrar();
    } catch (err) {
      setErro(err);
    }
  }

  return (
    <Panel title="Você ainda não tem equipe">
      {limites ? <p className="mb-5 text-[0.88rem] text-muted">Equipes têm de {limites.min} a {limites.max} integrantes.</p> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <form className="grid content-start gap-3" onSubmit={(e) => acao(e, () => api("/api/equipe", { method: "POST", body: { nome } }))}>
          <Field label="Criar equipe" hint="Você será o líder">
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da equipe" />
          </Field>
          <Button type="submit">Criar equipe</Button>
        </form>
        <form className="grid content-start gap-3" onSubmit={(e) => acao(e, () => api("/api/equipe/entrar", { method: "POST", body: { codigo } }))}>
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
