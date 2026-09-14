"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/src/components/layout/Header";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input, Select } from "@/src/components/ui/app";

const destinoPorPapel = { ADMIN: "/admin", JURADO: "/jurado", PARTICIPANTE: "/participante/projeto" } as const;

export default function EntrarPage() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [vinculo, setVinculo] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);
  const porEmail = identificador.includes("@");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const { user } = await api<{ user: { papel: keyof typeof destinoPorPapel } }>("/api/auth/login", {
        method: "POST",
        body: { identificador, senha, ...(!porEmail && vinculo && { vinculo }) },
      });
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next?.startsWith("/") ? next : destinoPorPapel[user.papel]);
      router.refresh();
    } catch (err) {
      setErro(err);
      setEnviando(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto grid min-h-[calc(100vh-92px)] max-w-[1440px] items-center gap-12 px-6 py-12 md:px-10 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-accent">{"// acesso"}</p>
          <h1 className="mt-3 font-display text-[3rem] font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-[4rem]">
            Entrar no<br /><span className="text-accent">HACKIF</span>
          </h1>
          <p className="mt-5 max-w-md text-muted">
            Participantes enviam o projeto da equipe, jurados avaliam os projetos atribuídos e a organização acompanha tudo pelo painel.
          </p>
        </div>

        <form onSubmit={entrar} className="grid gap-4 border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8">
          <Field label="E-mail, matrícula, SIAPE ou CPF">
            <Input autoComplete="username" required value={identificador} onChange={(e) => setIdentificador(e.target.value)} />
          </Field>
          {!porEmail && identificador ? (
            <Field label="Vínculo" hint="Necessário quando não é e-mail">
              <Select required value={vinculo} onChange={(e) => setVinculo(e.target.value)}>
                <option value="">Selecione</option>
                <option value="ALUNO">Aluno (matrícula)</option>
                <option value="SERVIDOR">Servidor (SIAPE)</option>
                <option value="EGRESSO">Egresso (CPF)</option>
                <option value="EXTERNO">Externo (CPF)</option>
              </Select>
            </Field>
          ) : null}
          <Field label="Senha">
            <Input type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
          </Field>
          {erro ? <Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /> : null}
          <Button type="submit" disabled={enviando} className="h-12">{enviando ? "Entrando…" : "Entrar ↗"}</Button>
          <div className="flex justify-between font-mono text-[0.72rem] uppercase text-muted">
            <Link href="/hackathon" className="hover:text-accent">Ver edição</Link>
            <Link href="/resultados" className="hover:text-accent">Resultados</Link>
          </div>
        </form>
      </main>
    </>
  );
}
