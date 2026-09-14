"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthLayout, AuthLinks } from "@/src/components/layout/AuthLayout";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input, Loading } from "@/src/components/ui/app";

function Formulario() {
  const token = useSearchParams().get("token") ?? "";
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<unknown>(null);

  async function redefinir(e: React.FormEvent) {
    e.preventDefault();
    if (senha !== confirmar) return setErro(new Error("As senhas não conferem"));
    setErro(null);
    try {
      await api("/api/auth/redefinir-senha", { method: "POST", body: { token, novaSenha: senha } });
      setOk(true);
    } catch (err) {
      setErro(err);
    }
  }

  if (!token) return <Alert title="Link inválido" lines={["Abra o link de redefinição completo."]} />;
  if (ok) return <Alert tone="ok" title="Senha redefinida" lines={["Já pode entrar com a nova senha."]} />;

  return (
    <form onSubmit={redefinir} className="grid gap-4">
      <Field label="Nova senha" hint="Mínimo de 8 caracteres">
        <Input required type="password" minLength={8} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
      </Field>
      <Field label="Confirmar nova senha">
        <Input required type="password" minLength={8} autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
      </Field>
      {erro ? <Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /> : null}
      <Button type="submit" className="h-12">Redefinir senha</Button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <AuthLayout tag="senha" title="Nova" highlight="senha" description="Escolha uma nova senha. O link vale por 1 hora e só pode ser usado uma vez.">
      <Suspense fallback={<Loading />}>
        <Formulario />
      </Suspense>
      <AuthLinks links={[{ href: "/login", label: "Ir para o login" }]} />
    </AuthLayout>
  );
}
