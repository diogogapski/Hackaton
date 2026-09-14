"use client";

import { useState } from "react";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { useApi } from "@/src/hooks/useApi";
import { api } from "@/src/lib/api-client";
import { Alert, Badge, Button, Empty, formatarData, Loading, PageHeader, Panel, Table } from "@/src/components/ui/app";

type Resposta = {
  hackathon: { id: string; nome: string; resultadosPublicados: boolean; resultadosPublicadosEm: string | null; exibirNotasPublicas: boolean };
  criterios: { id: string; nome: string; peso: number; prioridadeDesempate: number | null }[];
  ranking: {
    projetoId: string;
    posicao: number | null;
    notaFinal: number | null;
    mediasPorCriterio: Record<string, number | null>;
    jurados: number;
    atribuicoes: number;
    completo: boolean;
    projeto: { nome: string; enviadoEm: string | null };
    equipe: { nome: string };
  }[];
};

export default function AdminResultadosPage() {
  const { url } = useHackathon();
  const { data, error, loading, reload } = useApi<Resposta>(url("/api/admin/resultados"));
  const [erro, setErro] = useState<string | null>(null);

  async function publicar(publicado: boolean) {
    const msg = publicado
      ? "Publicar os resultados? O ranking fica público e os jurados não podem mais alterar notas."
      : "Despublicar os resultados?";
    if (!confirm(msg)) return;
    try {
      setErro(null);
      await api("/api/admin/resultados/publicar", { method: "POST", body: { hackathonId: data?.hackathon.id, publicado } });
      reload();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const incompletos = data?.ranking.filter((l) => !l.completo || l.jurados < l.atribuicoes).length ?? 0;

  return (
    <>
      <PageHeader
        tag="admin/resultados"
        title="Resultados"
        description="Prévia do ranking: média dos jurados por critério, ponderada pelos pesos. Desempate pelos critérios prioritários e depois pela ordem de envio."
        actions={data ? (
          data.hackathon.resultadosPublicados ? (
            <>
              <Badge tone="ok">publicado {formatarData(data.hackathon.resultadosPublicadosEm)}</Badge>
              <Button variant="ghost" onClick={() => publicar(false)}>Despublicar</Button>
            </>
          ) : (
            <Button onClick={() => publicar(true)}>Publicar resultados</Button>
          )
        ) : null}
      />

      {erro ? <div className="mb-4"><Alert title={erro} /></div> : null}
      {incompletos > 0 && !data?.hackathon.resultadosPublicados ? (
        <div className="mb-4"><Alert title={`${incompletos} projeto(s) com avaliações pendentes`} lines={["O ranking abaixo considera só as notas já enviadas."]} /></div>
      ) : null}

      <Panel>
        {loading && !data ? <Loading /> : null}
        {error ? <Alert title={error.message} /> : null}
        {data?.ranking.length === 0 ? <Empty>Nenhum projeto enviado</Empty> : null}
        {data && data.ranking.length > 0 ? (
          <Table head={["#", "Projeto", "Equipe", ...data.criterios.map((c) => `${c.nome} ×${c.peso}`), "Nota final", "Jurados"]}>
            {data.ranking.map((l) => (
              <tr key={l.projetoId}>
                <td className="font-display text-[1.3rem] font-semibold text-accent">{l.posicao ?? "—"}</td>
                <td><strong>{l.projeto.nome}</strong></td>
                <td>{l.equipe.nome}</td>
                {data.criterios.map((c) => <td key={c.id} className="font-mono">{l.mediasPorCriterio[c.id] ?? "—"}</td>)}
                <td className="font-mono text-[1rem] font-semibold">{l.notaFinal ?? "—"}</td>
                <td><Badge tone={l.jurados >= l.atribuicoes && l.completo ? "ok" : "alerta"}>{l.jurados}/{l.atribuicoes}</Badge></td>
              </tr>
            ))}
          </Table>
        ) : null}
      </Panel>
    </>
  );
}
