"use client";

import { useState } from "react";
import { AuthLayout, AuthLinks } from "@/src/components/layout/AuthLayout";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, Input } from "@/src/components/ui/app";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<unknown>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await api("/api/auth/recuperar-senha", { method: "POST", body: { email } });
      setEnviado(true);
    } catch (err) {
      setErro(err);
    }
  }

  return (
    <AuthLayout
      tag="senha"
      title="Recuperar"
      highlight="senha"
      description="Informe o e-mail da conta. Enviaremos um link de redefinição válido por uma hora."
    >
      {enviado ? (
        <Alert tone="ok" title="Solicitação registrada" lines={["Se o e-mail estiver cadastrado, um link de redefinição foi gerado."]} />
      ) : (
        <form onSubmit={enviar} className="grid gap-4">
          <Field label="E-mail"><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          {erro ? <Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /> : null}
          <Button type="submit" className="h-12">Enviar link</Button>
        </form>
      )}
      <AuthLinks links={[{ href: "/login", label: "Voltar ao login" }]} />
    </AuthLayout>
  );
}
