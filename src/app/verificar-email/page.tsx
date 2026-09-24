"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AuthLayout, AuthLinks } from "@/src/components/layout/AuthLayout";
import { Alert, Button, Field, Input, Loading } from "@/src/components/ui/app";
import { api, detalhesDoErro } from "@/src/lib/api-client";

function Formulario() {
  const params = useSearchParams();
  const token = params.get("token");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [estado, setEstado] = useState<"aguardando" | "confirmando" | "confirmado" | "reenviado">(
    token ? "confirmando" : "aguardando",
  );
  const [erro, setErro] = useState<unknown>(null);
  const executado = useRef(false);

  useEffect(() => {
    if (!token || executado.current) return;
    executado.current = true;
    api("/api/auth/verificar-email", { method: "POST", body: { token } })
      .then(() => setEstado("confirmado"))
      .catch(setErro);
  }, [token]);

  async function reenviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await api("/api/auth/reenviar-verificacao", { method: "POST", body: { email } });
      setEstado("reenviado");
    } catch (error) {
      setErro(error);
    }
  }

  if (estado === "confirmando" && !erro) return <Loading />;
  if (estado === "confirmado") {
    return (
      <div className="grid gap-4">
        <Alert tone="ok" title="E-mail confirmado" lines={["Sua conta está pronta para entrar."]} />
        <Link href="/login" className="inline-flex h-12 items-center justify-center bg-accent px-6 font-bold uppercase !text-[#050706]">Entrar</Link>
      </div>
    );
  }

  return (
    <form onSubmit={reenviar} className="grid gap-4">
      <Alert
        tone={estado === "reenviado" ? "ok" : undefined}
        title={estado === "reenviado" ? "Novo link enviado" : "Confira sua caixa de entrada"}
        lines={["O link de confirmação vale por 24 horas."]}
      />
      <Field label="E-mail">
        <Input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      {erro ? <Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /> : null}
      <Button type="submit" variant="ghost">Reenviar confirmação</Button>
    </form>
  );
}

export default function VerificarEmailPage() {
  return (
    <AuthLayout tag="conta" title="Confirmar" highlight="e-mail" description="A confirmação protege sua identidade e libera o acesso à conta.">
      <Suspense fallback={<Loading />}><Formulario /></Suspense>
      <AuthLinks links={[{ href: "/login", label: "Voltar ao login" }]} />
    </AuthLayout>
  );
}
