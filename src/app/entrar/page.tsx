"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout, AuthLinks } from "@/src/components/layout/AuthLayout";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input, Select } from "@/src/components/ui/app";

const destinoPorPapel = { ADMIN: "/admin", JURADO: "/jurado", PARTICIPANTE: "/participante/equipe" } as const;

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
    <AuthLayout
      tag="acesso"
      title="Entrar no"
      highlight="HACKIF"
      description="Participantes montam a equipe e enviam o projeto, jurados avaliam os projetos atribuídos e a organização acompanha tudo pelo painel."
    >
      <form onSubmit={entrar} className="grid gap-4">
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
      </form>
      <AuthLinks links={[
        { href: "/cadastro", label: "Criar conta" },
        { href: "/recuperar-senha", label: "Esqueci a senha" },
        { href: "/hackathon", label: "Ver edição" },
      ]} />
    </AuthLayout>
  );
}
