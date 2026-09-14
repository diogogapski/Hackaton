"use client";

import { useState } from "react";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import { Alert, Badge, Button, Empty, Field, Input, Loading, PageHeader, Panel, Table } from "@/src/components/ui/app";

type Jurado = { id: string; nome: string; email: string; vinculo: string; atribuicoes: number; concluidas: number };
type Usuario = { id: string; nome: string; email: string; papel: string; vinculo: string };
type Projeto = { id: string; nome: string; situacao: string; team: { nome: string }; atribuicoes: { juradoId: string; concluida: boolean }[] };

export default function AdminJuradosPage() {
  const { url } = useHackathon();
  const jurados = useApi<{ jurados: Jurado[] }>("/api/admin/jurados");
  const projetos = useApi<{ projetos: Projeto[] }>(url("/api/admin/projetos?situacao=ENVIADO"));
  const [busca, setBusca] = useState("");
  const candidatos = useApi<{ usuarios: Usuario[] }>(busca.length >= 2 ? `/api/admin/usuarios?papel=PARTICIPANTE&q=${encodeURIComponent(busca)}` : null);
  const [aviso, setAviso] = useState<{ tone: "ok" | "erro"; title: string; lines?: string[] } | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const recarregar = () => {
    jurados.reload();
    projetos.reload();
  };

  async function executar(acao: () => Promise<unknown>, sucesso: (r: unknown) => string) {
    try {
      const r = await acao();
      setAviso({ tone: "ok", title: sucesso(r) });
      recarregar();
    } catch (e) {
      setAviso({ tone: "erro", title: (e as Error).message, lines: detalhesDoErro(e) });
    }
  }

  const autorizar = (u: Usuario) =>
    executar(() => api("/api/admin/jurados", { method: "POST", body: { userId: u.id } }), () => `${u.nome} agora é jurado`);

  const distribuir = () =>
    executar(
      () => api<{ criadas: number; avisoJuradosInsuficientes: boolean }>(url("/api/admin/atribuicoes/distribuir"), { method: "POST" }),
      (r) => {
        const res = r as { criadas: number; avisoJuradosInsuficientes: boolean };
        return `${res.criadas} atribuição(ões) criada(s)${res.avisoJuradosInsuficientes ? " — há menos jurados que o configurado por projeto" : ""}`;
      },
    );

  const alternar = (juradoId: string, p: Projeto) => {
    const atribuido = p.atribuicoes.some((a) => a.juradoId === juradoId);
    return atribuido
      ? executar(() => api(`/api/admin/jurados/${juradoId}/atribuicoes/${p.id}`, { method: "DELETE" }), () => "Atribuição removida")
      : executar(() => api(`/api/admin/jurados/${juradoId}/atribuicoes`, { method: "POST", body: { projetoIds: [p.id] } }), () => "Projeto atribuído");
  };

  const jurado = jurados.data?.jurados.find((j) => j.id === selecionado);

  return (
    <>
      <PageHeader
        tag="admin/jurados"
        title="Jurados"
        description="Jurado é um usuário com papel JURADO. Autorize, distribua automaticamente ou atribua projetos manualmente."
        actions={<Button onClick={distribuir}>Distribuir automaticamente</Button>}
      />

      {aviso ? <div className="mb-6"><Alert tone={aviso.tone} title={aviso.title} lines={aviso.lines} /></div> : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Jurados autorizados">
          {jurados.loading && !jurados.data ? <Loading /> : null}
          {jurados.data?.jurados.length === 0 ? <Empty>Nenhum jurado</Empty> : null}
          {jurados.data && jurados.data.jurados.length > 0 ? (
            <Table head={["Nome", "E-mail", "Avaliações", ""]}>
              {jurados.data.jurados.map((j) => (
                <tr key={j.id} className={j.id === selecionado ? "bg-accent/5" : ""}>
                  <td><strong>{j.nome}</strong></td>
                  <td className="text-muted">{j.email}</td>
                  <td>
                    <Badge tone={j.atribuicoes > 0 && j.concluidas === j.atribuicoes ? "ok" : "neutro"}>{j.concluidas}/{j.atribuicoes}</Badge>
                  </td>
                  <td className="text-right">
                    <Button variant="ghost" className="h-8 px-3" onClick={() => setSelecionado(j.id === selecionado ? null : j.id)}>
                      {j.id === selecionado ? "Fechar" : "Atribuir"}
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          ) : null}
        </Panel>

        <Panel title="Autorizar novo jurado">
          <Field label="Buscar participante (nome ou e-mail)" hint="Usuários em equipe ativa precisam sair dela antes.">
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="mín. 2 caracteres" />
          </Field>
          <ul className="mt-4 grid gap-2">
            {candidatos.data?.usuarios.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/8 pb-2 text-[0.88rem]">
                <span>{u.nome} <span className="text-muted">· {u.email}</span></span>
                <Button className="h-8 px-3" onClick={() => autorizar(u)}>Autorizar</Button>
              </li>
            ))}
            {busca.length >= 2 && candidatos.data?.usuarios.length === 0 ? <li className="text-[0.85rem] text-muted">Nenhum participante encontrado</li> : null}
          </ul>
        </Panel>
      </div>

      {jurado ? (
        <Panel title={`Projetos de ${jurado.nome}`} className="mt-6">
          {projetos.data?.projetos.length === 0 ? <Empty>Nenhum projeto enviado nesta edição</Empty> : null}
          <div className="grid gap-2 md:grid-cols-2">
            {projetos.data?.projetos.map((p) => {
              const atr = p.atribuicoes.find((a) => a.juradoId === jurado.id);
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-foreground/10 px-3 py-2">
                  <span className="text-[0.88rem]">
                    <strong>{p.nome}</strong> <span className="text-muted">· {p.team.nome}</span>
                    {atr?.concluida ? <span className="ml-2"><Badge tone="ok">avaliado</Badge></span> : null}
                  </span>
                  <Button
                    variant={atr ? "danger" : "ghost"}
                    className="h-8 px-3"
                    disabled={atr?.concluida}
                    onClick={() => alternar(jurado.id, p)}
                  >
                    {atr ? "Remover" : "Atribuir"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Panel>
      ) : null}
    </>
  );
}
