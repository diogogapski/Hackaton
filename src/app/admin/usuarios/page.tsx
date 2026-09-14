"use client";

import { useState } from "react";
import { useApi } from "@/src/hooks/useApi";
import { api } from "@/src/lib/api-client";
import { Alert, Badge, Button, Empty, formatarData, Input, Loading, PageHeader, Panel, Select, Table } from "@/src/components/ui/app";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  vinculo: string;
  matricula: string | null;
  siape: string | null;
  curso: string | null;
  papel: "PARTICIPANTE" | "JURADO" | "ADMIN";
  situacao: "ATIVO" | "BLOQUEADO";
  criadoEm: string;
};
type Resposta = { usuarios: Usuario[]; total: number; page: number; pageSize: number };

const PAGE_SIZE = 20;

export default function AdminUsuariosPage() {
  const [filtros, setFiltros] = useState({ q: "", papel: "", vinculo: "", situacao: "" });
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  for (const [k, v] of Object.entries(filtros)) if (v) params.set(k, v);
  const { data, error, loading, reload } = useApi<Resposta>(`/api/admin/usuarios?${params}`);
  const [aviso, setAviso] = useState<{ tone: "ok" | "erro"; title: string } | null>(null);

  const filtrar = (campo: keyof typeof filtros) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros((f) => ({ ...f, [campo]: e.target.value }));
    setPage(1);
  };

  async function acao(fn: () => Promise<unknown>, sucesso: string) {
    try {
      await fn();
      setAviso({ tone: "ok", title: sucesso });
      reload();
    } catch (e) {
      setAviso({ tone: "erro", title: (e as Error).message });
    }
  }

  const paginas = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <>
      <PageHeader tag="admin/usuarios" title="Usuários" description="Busca, papéis (participante, jurado, admin) e bloqueio de contas." />
      {aviso ? <div className="mb-4"><Alert tone={aviso.tone} title={aviso.title} /></div> : null}

      <Panel className="mb-6">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <Input placeholder="Buscar por nome ou e-mail" value={filtros.q} onChange={filtrar("q")} aria-label="Buscar" />
          <Select value={filtros.papel} onChange={filtrar("papel")} aria-label="Papel">
            <option value="">Todos os papéis</option>
            <option value="PARTICIPANTE">Participante</option>
            <option value="JURADO">Jurado</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <Select value={filtros.vinculo} onChange={filtrar("vinculo")} aria-label="Vínculo">
            <option value="">Todos os vínculos</option>
            <option value="ALUNO">Aluno</option>
            <option value="SERVIDOR">Servidor</option>
            <option value="EGRESSO">Egresso</option>
            <option value="EXTERNO">Externo</option>
          </Select>
          <Select value={filtros.situacao} onChange={filtrar("situacao")} aria-label="Situação">
            <option value="">Todas as situações</option>
            <option value="ATIVO">Ativo</option>
            <option value="BLOQUEADO">Bloqueado</option>
          </Select>
        </div>
      </Panel>

      <Panel title={data ? `${data.total} usuário(s)` : undefined}>
        {loading && !data ? <Loading /> : null}
        {error ? <Alert title={error.message} /> : null}
        {data?.usuarios.length === 0 ? <Empty>Nenhum usuário encontrado</Empty> : null}
        {data && data.usuarios.length > 0 ? (
          <Table head={["Nome", "Vínculo", "Cadastro", "Papel", "Situação", ""]}>
            {data.usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.nome}</strong>
                  <div className="text-[0.78rem] text-muted">{u.email}</div>
                </td>
                <td className="text-[0.85rem]">
                  {u.vinculo}
                  <div className="text-[0.75rem] text-muted">{u.matricula ?? u.siape ?? ""}{u.curso ? ` · ${u.curso}` : ""}</div>
                </td>
                <td className="whitespace-nowrap text-[0.85rem]">{formatarData(u.criadoEm)}</td>
                <td>
                  <Select
                    className="w-40 py-1.5"
                    value={u.papel}
                    aria-label={`Papel de ${u.nome}`}
                    onChange={(e) => acao(
                      () => api(`/api/admin/usuarios/${u.id}/papel`, { method: "PUT", body: { papel: e.target.value } }),
                      `Papel de ${u.nome} alterado para ${e.target.value}`,
                    )}
                  >
                    <option value="PARTICIPANTE">Participante</option>
                    <option value="JURADO">Jurado</option>
                    <option value="ADMIN">Admin</option>
                  </Select>
                </td>
                <td><Badge tone={u.situacao === "ATIVO" ? "ok" : "erro"}>{u.situacao}</Badge></td>
                <td className="text-right">
                  <Button
                    variant={u.situacao === "ATIVO" ? "danger" : "ghost"}
                    className="h-8 px-3"
                    onClick={() => acao(
                      () => api(`/api/admin/usuarios/${u.id}/situacao`, {
                        method: "PUT",
                        body: { situacao: u.situacao === "ATIVO" ? "BLOQUEADO" : "ATIVO" },
                      }),
                      u.situacao === "ATIVO" ? `${u.nome} bloqueado` : `${u.nome} desbloqueado`,
                    )}
                  >
                    {u.situacao === "ATIVO" ? "Bloquear" : "Desbloquear"}
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        ) : null}

        {data && paginas > 1 ? (
          <div className="mt-4 flex items-center justify-end gap-3 font-mono text-[0.75rem] uppercase text-muted">
            <Button variant="ghost" className="h-8 px-3" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <span>{page} / {paginas}</span>
            <Button variant="ghost" className="h-8 px-3" disabled={page >= paginas} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        ) : null}
      </Panel>
    </>
  );
}
