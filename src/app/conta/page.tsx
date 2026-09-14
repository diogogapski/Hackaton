"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/src/hooks/useApi";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Button, Field, formatarData, Input, Loading, PageHeader, Panel } from "@/src/components/ui/app";

type Perfil = {
  nome: string;
  email: string;
  telefone: string | null;
  vinculo: string;
  matricula: string | null;
  siape: string | null;
  curso: string | null;
  papel: string;
  termosAceitosEm: string | null;
  criadoEm: string;
};

type Resultado = { ok?: string; erro?: unknown } | null;

function Retorno({ r }: { r: Resultado }) {
  if (r?.ok) return <Alert tone="ok" title={r.ok} />;
  if (r?.erro) return <Alert title={(r.erro as Error).message} lines={detalhesDoErro(r.erro)} />;
  return null;
}

export default function ContaPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi<{ user: Perfil }>("/api/perfil");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [senhas, setSenhas] = useState({ senhaAtual: "", novaSenha: "", confirmar: "" });
  const [rPerfil, setRPerfil] = useState<Resultado>(null);
  const [rSenha, setRSenha] = useState<Resultado>(null);

  useEffect(() => {
    if (!data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preenche o formulário com o perfil salvo
    setForm({ nome: data.user.nome, email: data.user.email, telefone: data.user.telefone ?? "" });
  }, [data]);

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setRPerfil(null);
    try {
      await api("/api/perfil", { method: "PUT", body: { nome: form.nome, email: form.email, telefone: form.telefone || null } });
      setRPerfil({ ok: "Perfil atualizado" });
      reload();
      router.refresh();
    } catch (err) {
      setRPerfil({ erro: err });
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setRSenha(null);
    if (senhas.novaSenha !== senhas.confirmar) return setRSenha({ erro: new Error("As senhas não conferem") });
    try {
      await api("/api/perfil/senha", { method: "PUT", body: { senhaAtual: senhas.senhaAtual, novaSenha: senhas.novaSenha } });
      setSenhas({ senhaAtual: "", novaSenha: "", confirmar: "" });
      setRSenha({ ok: "Senha alterada" });
    } catch (err) {
      setRSenha({ erro: err });
    }
  }

  if (loading && !data) return <Loading />;
  if (error) return <Alert title={error.message} />;
  if (!data) return null;
  const u = data.user;

  const documento = u.matricula ? ["Matrícula", u.matricula] : u.siape ? ["SIAPE", u.siape] : null;

  return (
    <>
      <PageHeader tag="conta" title="Minha conta" description="Documentos de identificação (matrícula, SIAPE, CPF) não podem ser alterados pelo próprio usuário." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Perfil">
          <form onSubmit={salvarPerfil} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Field label="Nome"><Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Field></div>
            <Field label="E-mail"><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Telefone"><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></Field>
            <dl className="grid grid-cols-2 gap-3 border-t border-foreground/10 pt-4 text-[0.85rem] md:col-span-2">
              {[
                ["Vínculo", u.vinculo],
                ["Papel", u.papel],
                ...(documento ? [documento] : []),
                ...(u.curso ? [["Curso", u.curso]] : []),
                ["Termos aceitos em", formatarData(u.termosAceitosEm)],
                ["Conta criada em", formatarData(u.criadoEm)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[0.68rem] uppercase text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="md:col-span-2"><Retorno r={rPerfil} /></div>
            <div className="md:col-span-2"><Button type="submit">Salvar perfil</Button></div>
          </form>
        </Panel>

        <Panel title="Trocar senha">
          <form onSubmit={trocarSenha} className="grid gap-4">
            <Field label="Senha atual">
              <Input required type="password" autoComplete="current-password" value={senhas.senhaAtual} onChange={(e) => setSenhas({ ...senhas, senhaAtual: e.target.value })} />
            </Field>
            <Field label="Nova senha" hint="Mínimo de 8 caracteres">
              <Input required type="password" minLength={8} autoComplete="new-password" value={senhas.novaSenha} onChange={(e) => setSenhas({ ...senhas, novaSenha: e.target.value })} />
            </Field>
            <Field label="Confirmar nova senha">
              <Input required type="password" minLength={8} autoComplete="new-password" value={senhas.confirmar} onChange={(e) => setSenhas({ ...senhas, confirmar: e.target.value })} />
            </Field>
            <Retorno r={rSenha} />
            <Button type="submit" variant="ghost">Alterar senha</Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
