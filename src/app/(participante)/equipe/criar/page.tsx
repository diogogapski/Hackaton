"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEquipe } from "@/src/components/participante/useEquipe";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input, Loading, PageHeader, Panel } from "@/src/components/ui/app";

/** Criar equipe (planejamento, página 15): quem cria vira líder/responsável. */
export default function CriarEquipePage() {
  const router = useRouter();
  const { equipe, h, carregando } = useEquipe();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await api("/api/equipe", { method: "POST", body: { nome } });
      router.push("/equipe/gerenciar");
    } catch (err) {
      setErro(err);
      setEnviando(false);
    }
  }

  return (
    <>
      <PageHeader tag="equipe/criar" title="Criar equipe" description="Você será o líder e poderá convidar os integrantes com um código." />
      {carregando ? <Loading /> : null}
      {equipe ? (
        <Alert title={`Você já participa da equipe ${equipe.nome}`} lines={["Para criar outra, saia da equipe atual primeiro."]} />
      ) : null}
      {!carregando && !equipe ? (
        <Panel className="max-w-xl">
          <form onSubmit={criar} className="grid gap-4">
            <Field label="Nome da equipe" hint="Único na edição">
              <Input required minLength={2} maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} />
            </Field>
            {h ? <p className="text-[0.85rem] text-muted">A equipe fica INSCRITA ao atingir {h.limiteMinIntegrantes} integrantes (máximo {h.limiteMaxIntegrantes}).</p> : null}
            {h && !h.inscricoesAbertas ? <Alert title="As inscrições desta edição estão fechadas" /> : null}
            {erro ? <Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={enviando || (h && !h.inscricoesAbertas)}>{enviando ? "Criando…" : "Criar equipe"}</Button>
              <Link href="/equipe" className="inline-flex h-10 items-center px-3 text-[0.8rem] uppercase text-muted hover:text-accent">Cancelar</Link>
            </div>
          </form>
        </Panel>
      ) : null}
    </>
  );
}
