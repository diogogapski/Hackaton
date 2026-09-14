"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout, AuthLinks } from "@/src/components/layout/AuthLayout";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Checkbox, Field, Input, Select } from "@/src/components/ui/app";

type Tipo = "aluno" | "servidor" | "externo";

const TIPOS: { id: Tipo; label: string }[] = [
  { id: "aluno", label: "Aluno" },
  { id: "servidor", label: "Servidor" },
  { id: "externo", label: "Egresso / Externo" },
];

export default function CadastroPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("aluno");
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "", matricula: "", curso: "", siape: "", cpf: "", vinculo: "EGRESSO" });
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (form.senha !== form.confirmar) {
      setErro(new Error("As senhas não conferem"));
      return;
    }
    setEnviando(true);
    setErro(null);

    const base = { nome: form.nome, email: form.email, senha: form.senha, aceiteTermos: aceite };
    const corpo =
      tipo === "aluno" ? { ...base, matricula: form.matricula, curso: form.curso }
      : tipo === "servidor" ? { ...base, siape: form.siape }
      : { ...base, vinculo: form.vinculo, ...(form.cpf && { cpf: form.cpf }) };

    try {
      await api(`/api/auth/register/${tipo}`, { method: "POST", body: corpo });
      router.push("/participante/equipe");
      router.refresh();
    } catch (err) {
      setErro(err);
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      tag="inscricao"
      title="Criar conta no"
      highlight="HACKIF"
      description="Cadastre-se com o seu vínculo com o IFPR. Depois é só criar uma equipe ou entrar em uma com o código de convite."
    >
      <div className="mb-6 grid grid-cols-3 border border-foreground/15" role="tablist">
        {TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tipo === t.id}
            onClick={() => setTipo(t.id)}
            className={`cursor-pointer border-0 px-2 py-3 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.04em] ${
              tipo === t.id ? "bg-accent !text-[#050706]" : "bg-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={cadastrar} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><Field label="Nome completo *"><Input required autoComplete="name" value={form.nome} onChange={set("nome")} /></Field></div>
        <div className="md:col-span-2">
          <Field label={tipo === "servidor" ? "E-mail institucional *" : "E-mail *"}>
            <Input required type="email" autoComplete="email" value={form.email} onChange={set("email")} />
          </Field>
        </div>

        {tipo === "aluno" ? (
          <>
            <Field label="Matrícula *"><Input required value={form.matricula} onChange={set("matricula")} /></Field>
            <Field label="Curso *"><Input required value={form.curso} onChange={set("curso")} /></Field>
          </>
        ) : null}
        {tipo === "servidor" ? (
          <div className="md:col-span-2"><Field label="SIAPE *"><Input required value={form.siape} onChange={set("siape")} /></Field></div>
        ) : null}
        {tipo === "externo" ? (
          <>
            <Field label="Vínculo *">
              <Select value={form.vinculo} onChange={set("vinculo")}>
                <option value="EGRESSO">Egresso</option>
                <option value="EXTERNO">Externo</option>
              </Select>
            </Field>
            <Field label="CPF" hint="Opcional"><Input inputMode="numeric" value={form.cpf} onChange={set("cpf")} placeholder="000.000.000-00" /></Field>
          </>
        ) : null}

        <Field label="Senha *" hint="Mínimo de 8 caracteres">
          <Input required type="password" autoComplete="new-password" minLength={8} value={form.senha} onChange={set("senha")} />
        </Field>
        <Field label="Confirmar senha *">
          <Input required type="password" autoComplete="new-password" minLength={8} value={form.confirmar} onChange={set("confirmar")} />
        </Field>

        <div className="md:col-span-2">
          <Checkbox label="Li e aceito os termos de uso e a política de privacidade" checked={aceite} onChange={(e) => setAceite(e.target.checked)} required />
        </div>

        {erro ? <div className="md:col-span-2"><Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} /></div> : null}
        <div className="md:col-span-2">
          <Button type="submit" disabled={enviando} className="h-12 w-full">{enviando ? "Criando conta…" : "Criar conta ↗"}</Button>
        </div>
      </form>
      <AuthLinks links={[{ href: "/entrar", label: "Já tenho conta" }]} />
    </AuthLayout>
  );
}
