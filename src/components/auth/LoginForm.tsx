"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input } from "@/src/components/ui/app";

export type VinculoLogin = "ALUNO" | "SERVIDOR" | "EXTERNO";

const destinoPorPapel = { ADMIN: "/admin", JURADO: "/jurado", PARTICIPANTE: "/dashboard" } as const;

const rotulos: Record<VinculoLogin | "EMAIL", { campo: string; dica?: string }> = {
  ALUNO: { campo: "Matrícula ou e-mail" },
  SERVIDOR: { campo: "SIAPE ou e-mail" },
  EXTERNO: { campo: "CPF ou e-mail", dica: "Sem CPF cadastrado? Use o e-mail." },
  EMAIL: { campo: "E-mail" },
};

/**
 * Login por vínculo (planejamento: /login/aluno, /login/servidor, /login/externo).
 * Com "@" o identificador é tratado como e-mail; senão, como matrícula/SIAPE/CPF do vínculo.
 */
export function LoginForm({ vinculo }: { vinculo?: VinculoLogin }) {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);
  const rotulo = rotulos[vinculo ?? "EMAIL"];

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const porEmail = identificador.includes("@");
      const resposta = await api<{ user: { papel: keyof typeof destinoPorPapel } }>("/api/auth/login", {
        method: "POST",
        body: { identificador, senha, ...(!porEmail && vinculo && { vinculo }) },
      });
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next?.startsWith("/") ? next : destinoPorPapel[resposta.user.papel]);
      router.refresh();
    } catch (err) {
      setErro(err);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="grid gap-4">
      <Field label={rotulo.campo} hint={rotulo.dica}>
        <Input autoComplete="username" required value={identificador} onChange={(e) => setIdentificador(e.target.value)} />
      </Field>
      <Field label="Senha">
        <Input type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
      </Field>
      {erro ? <Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /> : null}
      <Button type="submit" disabled={enviando} className="h-12">{enviando ? "Entrando…" : "Entrar ↗"}</Button>
    </form>
  );
}
