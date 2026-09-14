"use client";

import Link from "next/link";
import { useState } from "react";
import { SemEquipe } from "@/src/components/participante/SemEquipe";
import { useApi } from "@/src/hooks/useApi";
import { api } from "@/src/lib/api-client";
import { Alert, Badge, Button, formatarData, Loading, PageHeader, Panel, Table } from "@/src/components/ui/app";

type Membro = { id: string; entrouEm: string; user: { id: string; nome: string; email: string; vinculo: string; curso: string | null } };
type Equipe = { id: string; nome: string; situacao: string; liderId: string | null; codigoConvite: string | null; membros: Membro[] };
type Hackathon = { nome: string; limiteMinIntegrantes: number; limiteMaxIntegrantes: number; inscricoesAbertas: boolean };

const tomSituacao = { INSCRITA: "ok", EM_FORMACAO: "alerta", DESCLASSIFICADA: "erro" } as const;

export default function ParticipanteEquipePage() {
  const eu = useApi<{ user: { id: string } }>("/api/auth/me");
  const hackathon = useApi<{ hackathon: Hackathon }>("/api/hackathon/atual");
  const { data, loading, error, reload } = useApi<{ equipe: Equipe | null }>("/api/equipe");
  const [aviso, setAviso] = useState<{ tone: "ok" | "erro"; title: string } | null>(null);

  const equipe = data?.equipe ?? null;
  const h = hackathon.data?.hackathon;
  const meuId = eu.data?.user.id;
  const souLider = Boolean(equipe && meuId && equipe.liderId === meuId);

  async function acao(fn: () => Promise<unknown>, sucesso: string, confirmar?: string) {
    if (confirmar && !confirm(confirmar)) return;
    try {
      await fn();
      setAviso({ tone: "ok", title: sucesso });
      reload();
    } catch (e) {
      setAviso({ tone: "erro", title: (e as Error).message });
    }
  }

  return (
    <>
      <PageHeader
        tag="participante/equipe"
        title={equipe ? equipe.nome : "Equipe"}
        description={h ? `${h.nome} · equipes de ${h.limiteMinIntegrantes} a ${h.limiteMaxIntegrantes} integrantes` : undefined}
        actions={equipe ? (
          <>
            <Badge tone={tomSituacao[equipe.situacao as keyof typeof tomSituacao] ?? "neutro"}>{equipe.situacao}</Badge>
            <Link href="/participante/projeto" className="inline-flex h-10 items-center bg-accent px-5 text-[0.8rem] font-bold uppercase !text-[#050706] hover:bg-foreground">Projeto ↗</Link>
          </>
        ) : null}
      />

      {aviso ? <div className="mb-6"><Alert tone={aviso.tone} title={aviso.title} /></div> : null}
      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} /> : null}

      {data && !equipe ? (
        <SemEquipe aoEntrar={reload} limites={h ? { min: h.limiteMinIntegrantes, max: h.limiteMaxIntegrantes } : undefined} />
      ) : null}

      {equipe ? (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Panel title={`Integrantes (${equipe.membros.length}/${h?.limiteMaxIntegrantes ?? "?"})`}>
            {h && equipe.membros.length < h.limiteMinIntegrantes ? (
              <div className="mb-4">
                <Alert title={`Faltam ${h.limiteMinIntegrantes - equipe.membros.length} integrante(s) para a equipe ficar INSCRITA`} />
              </div>
            ) : null}
            <Table head={["Nome", "Vínculo", "Entrou em", ""]}>
              {equipe.membros.map((m) => {
                const lider = m.user.id === equipe.liderId;
                return (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.user.nome}</strong> {lider ? <Badge tone="ok">líder</Badge> : null}
                      {m.user.id === meuId ? <span className="ml-2 font-mono text-[0.7rem] text-muted">(você)</span> : null}
                      <div className="text-[0.78rem] text-muted">{m.user.email}</div>
                    </td>
                    <td className="text-[0.85rem]">{m.user.vinculo}{m.user.curso ? ` · ${m.user.curso}` : ""}</td>
                    <td className="whitespace-nowrap text-[0.85rem]">{formatarData(m.entrouEm)}</td>
                    <td className="text-right">
                      {souLider && !lider ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            className="h-8 px-3"
                            onClick={() => acao(
                              () => api("/api/equipe/transferir-lideranca", { method: "POST", body: { userId: m.user.id } }),
                              `${m.user.nome} agora é o líder`,
                              `Transferir a liderança para ${m.user.nome}?`,
                            )}
                          >
                            Tornar líder
                          </Button>
                          <Button
                            variant="danger"
                            className="h-8 px-3"
                            onClick={() => acao(
                              () => api(`/api/equipe/membro/${m.user.id}`, { method: "DELETE" }),
                              `${m.user.nome} foi removido`,
                              `Remover ${m.user.nome} da equipe?`,
                            )}
                          >
                            Remover
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Panel>

          <div className="grid content-start gap-6">
            {souLider ? (
              <Panel title="Convite">
                <p className="text-[0.88rem] text-muted">Compartilhe o código com quem vai entrar na equipe.</p>
                <p className="my-4 font-display text-[2.2rem] font-semibold tracking-[0.08em] text-accent">{equipe.codigoConvite ?? "—"}</p>
                <Button
                  variant="ghost"
                  onClick={() => acao(() => api("/api/equipe/convite", { method: "POST" }), "Novo código gerado; o anterior deixou de valer")}
                >
                  Gerar novo código
                </Button>
              </Panel>
            ) : null}

            <Panel title="Sair da equipe">
              <p className="mb-4 text-[0.88rem] text-muted">
                {souLider && equipe.membros.length > 1
                  ? "Se você sair, o integrante mais antigo vira líder automaticamente."
                  : "Você poderá criar ou entrar em outra equipe enquanto as inscrições estiverem abertas."}
              </p>
              <Button
                variant="danger"
                onClick={() => acao(() => api("/api/equipe/sair", { method: "POST" }), "Você saiu da equipe", "Sair da equipe?")}
              >
                Sair da equipe
              </Button>
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}
