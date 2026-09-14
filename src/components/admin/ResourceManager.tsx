"use client";

import { useState, type ReactNode } from "react";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { api, detalhesDoErro } from "@/src/lib/api-client";
import {
  Alert, Button, Checkbox, deInputData, Empty, Field, Input, Loading, Panel, paraInputData, Select, Table, Textarea,
} from "@/src/components/ui/app";

type Item = Record<string, unknown> & { id: string };

export type Campo = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "datetime" | "checkbox" | "select";
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  /** Campo vazio vira null em vez de ser omitido (permite limpar). */
  nullable?: boolean;
  /** Valor inicial ao editar quando o campo do formulário não existe no item (ex.: publicar ← publicadoEm). */
  valorInicial?: (item: Item) => unknown;
};

export type Coluna = { label: string; render: (item: Item) => ReactNode };

/**
 * CRUD genérico sobre os endpoints admin do Bloco B:
 * GET/POST {endpoint} e PUT/DELETE {endpoint}/:id.
 */
export function ResourceManager({ endpoint, listKey, singular, campos, colunas, extraPayload, podeExcluir = true, aoSalvar }: {
  endpoint: string;
  listKey: string;
  singular: string;
  campos: Campo[];
  colunas: Coluna[];
  /** Ajusta o corpo enviado (ex.: nomes diferentes de campo). */
  extraPayload?: (valores: Record<string, unknown>, editando: Item | null) => Record<string, unknown>;
  podeExcluir?: boolean;
  aoSalvar?: () => void;
}) {
  const { url, hackathonId } = useHackathon();
  const { data, loading, error, reload } = useApi<Record<string, Item[]>>(url(endpoint));
  const [editando, setEditando] = useState<Item | null>(null);
  const [aberto, setAberto] = useState(false);
  const [valores, setValores] = useState<Record<string, unknown>>({});
  const [erro, setErro] = useState<unknown>(null);
  const [salvando, setSalvando] = useState(false);

  const itens = data?.[listKey] ?? [];

  function abrir(item: Item | null) {
    setEditando(item);
    setErro(null);
    setAberto(true);
    const iniciais: Record<string, unknown> = {};
    for (const c of campos) {
      const v = item && c.valorInicial ? c.valorInicial(item) : item?.[c.name];
      iniciais[c.name] = c.type === "datetime" ? paraInputData(v as string) : c.type === "checkbox" ? Boolean(v) : v ?? "";
    }
    setValores(iniciais);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const corpo: Record<string, unknown> = {};
      for (const c of campos) {
        const v = valores[c.name];
        if (c.type === "checkbox") corpo[c.name] = Boolean(v);
        else if (v === "" || v === undefined) {
          if (c.nullable && editando) corpo[c.name] = null;
        } else if (c.type === "number") corpo[c.name] = Number(v);
        else if (c.type === "datetime") corpo[c.name] = deInputData(String(v));
        else corpo[c.name] = v;
      }
      const payload = extraPayload ? extraPayload(corpo, editando) : corpo;
      if (editando) await api(`${endpoint}/${editando.id}`, { method: "PUT", body: payload });
      else await api(endpoint, { method: "POST", body: { ...payload, ...(hackathonId && { hackathonId }) } });
      setAberto(false);
      reload();
      aoSalvar?.();
    } catch (err) {
      setErro(err);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(item: Item) {
    if (!confirm(`Excluir este ${singular}?`)) return;
    try {
      await api(`${endpoint}/${item.id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div className="grid gap-6">
      <Panel
        title={`${itens.length} ${singular}(s)`}
        actions={<Button onClick={() => abrir(null)}>+ Novo {singular}</Button>}
      >
        {loading && !data ? <Loading /> : null}
        {error ? <Alert title={error.message} /> : null}
        {data && itens.length === 0 ? <Empty>Nenhum {singular} cadastrado</Empty> : null}
        {itens.length > 0 ? (
          <Table head={[...colunas.map((c) => c.label), ""]}>
            {itens.map((item) => (
              <tr key={item.id}>
                {colunas.map((c) => <td key={c.label}>{c.render(item)}</td>)}
                <td className="whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="h-8 px-3" onClick={() => abrir(item)}>Editar</Button>
                    {podeExcluir ? <Button variant="danger" className="h-8 px-3" onClick={() => excluir(item)}>Excluir</Button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : null}
      </Panel>

      {aberto ? (
        <Panel title={editando ? `Editar ${singular}` : `Novo ${singular}`}>
          <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
            {campos.map((c) => {
              const valor = valores[c.name];
              const set = (v: unknown) => setValores((atual) => ({ ...atual, [c.name]: v }));
              const largo = c.type === "textarea" ? "md:col-span-2" : "";
              if (c.type === "checkbox") {
                return (
                  <div key={c.name} className="flex items-end pb-2">
                    <Checkbox label={c.label} checked={Boolean(valor)} onChange={(e) => set(e.target.checked)} />
                  </div>
                );
              }
              return (
                <div key={c.name} className={largo}>
                  <Field label={`${c.label}${c.required ? " *" : ""}`} hint={c.hint}>
                    {c.type === "textarea" ? (
                      <Textarea required={c.required} value={String(valor ?? "")} onChange={(e) => set(e.target.value)} />
                    ) : c.type === "select" ? (
                      <Select required={c.required} value={String(valor ?? "")} onChange={(e) => set(e.target.value)}>
                        <option value="">—</option>
                        {c.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    ) : (
                      <Input
                        type={c.type === "datetime" ? "datetime-local" : c.type === "number" ? "number" : "text"}
                        step={c.type === "number" ? "any" : undefined}
                        required={c.required}
                        value={String(valor ?? "")}
                        onChange={(e) => set(e.target.value)}
                      />
                    )}
                  </Field>
                </div>
              );
            })}
            {erro ? (
              <div className="md:col-span-2">
                <Alert title={(erro as Error).message} lines={detalhesDoErro(erro)} />
              </div>
            ) : null}
            <div className="flex gap-3 md:col-span-2">
              <Button type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Button>
              <Button type="button" variant="ghost" onClick={() => setAberto(false)}>Cancelar</Button>
            </div>
          </form>
        </Panel>
      ) : null}
    </div>
  );
}
