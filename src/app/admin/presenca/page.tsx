"use client";

import { useState } from "react";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { api } from "@/src/lib/api-client";
import { Alert, Badge, Button, Empty, Input, Loading, PageHeader, Panel, Stat, Table } from "@/src/components/ui/app";

type Participante = {
  id: string;
  nome: string;
  email: string;
  vinculo: string;
  curso: string | null;
  lider: boolean;
  presente: boolean;
  equipe: { id: string; nome: string; situacao: string };
};
type Resposta = { hackathon: { id: string; nome: string }; total: number; presentes: number; participantes: Participante[] };

/** Check-in do evento: a comissão marca quem chegou (canvas: coordenação precisa de "presentes"). */
export default function AdminPresencaPage() {
  const { url, hackathonId } = useHackathon();
  const { data, error, loading, reload } = useApi<Resposta>(url("/api/admin/presencas"));
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function marcar(p: Participante, presente: boolean) {
    try {
      setErro(null);
      await api("/api/admin/presencas", { method: "POST", body: { userId: p.id, presente, ...(hackathonId && { hackathonId }) } });
      reload();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const termo = busca.trim().toLowerCase();
  const lista = (data?.participantes ?? []).filter(
    (p) => !termo || p.nome.toLowerCase().includes(termo) || p.equipe.nome.toLowerCase().includes(termo) || p.email.includes(termo),
  );

  return (
    <>
      <PageHeader
        tag="admin/presenca"
        title="Presença"
        description="Check-in dos participantes no evento. Busque pelo nome, e-mail ou equipe e marque quem chegou."
        actions={<Input className="w-72" placeholder="Buscar participante ou equipe" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar participante" />}
      />
      {erro ? <div className="mb-4"><Alert title={erro} /></div> : null}
      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} /> : null}

      {data ? (
        <div className="grid min-w-0 grid-cols-1 gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Participantes em equipes" value={data.total} />
            <Stat label="Presentes" value={data.presentes} />
            <Stat label="Ausentes" value={data.total - data.presentes} />
          </div>
          <Panel>
            {lista.length === 0 ? <Empty>Nenhum participante encontrado</Empty> : (
              <Table head={["Participante", "Equipe", "Vínculo", "Presença", ""]}>
                {lista.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.nome}</strong> {p.lider ? <Badge tone="ok">líder</Badge> : null}
                      <div className="text-[0.78rem] text-muted">{p.email}</div>
                    </td>
                    <td>
                      {p.equipe.nome}
                      <div className="font-mono text-[0.68rem] uppercase text-muted">{p.equipe.situacao}</div>
                    </td>
                    <td className="text-[0.85rem]">{p.vinculo}{p.curso ? ` · ${p.curso}` : ""}</td>
                    <td>{p.presente ? <Badge tone="ok">presente</Badge> : <Badge>ausente</Badge>}</td>
                    <td className="text-right">
                      {p.presente ? (
                        <Button variant="ghost" className="h-8 px-3" onClick={() => marcar(p, false)}>Desfazer</Button>
                      ) : (
                        <Button className="h-8 px-3" onClick={() => marcar(p, true)}>Marcar presença</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Panel>
        </div>
      ) : null}
    </>
  );
}
