"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input } from "@/src/components/ui/app";

const destinoPorPapel = { ADMIN: "/admin", JURADO: "/jurado", PARTICIPANTE: "/dashboard" } as const;

/**
 * Login único para todos: participantes, jurados e administradores.
 * O mesmo campo aceita e-mail, matrícula, SIAPE ou CPF; depois de entrar, cada pessoa vai para a
 * sua área conforme o papel (ou para o endereço de `?next=`).
 */
export function LoginForm() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await api<{ user: { papel: keyof typeof destinoPorPapel } }>("/api/auth/login", {
        method: "POST",
        body: { identificador, senha },
      });
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : destinoPorPapel[resposta.user.papel]);
      router.refresh();
    } catch (err) {
      setErro(err);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="grid gap-4">
      <Field label="E-mail, matrícula, SIAPE ou CPF">
        <Input autoComplete="username" required autoFocus value={identificador} onChange={(e) => setIdentificador(e.target.value)} />
      </Field>
      <Field label="Senha">
        <Input type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
      </Field>
      {erro ? <Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /> : null}
      <Button type="submit" disabled={enviando} className="h-12">{enviando ? "Entrando…" : "Entrar ↗"}</Button>
    </form>
  );
}
