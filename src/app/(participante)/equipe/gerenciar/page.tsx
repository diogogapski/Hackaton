"use client";

import Link from "next/link";
import { useState } from "react";
import { tomSituacaoEquipe, useEquipe } from "@/src/components/participante/useEquipe";
import { api } from "@/src/lib/api-client";
import { Alert, Badge, Button, Loading, PageHeader, Panel, Table } from "@/src/components/ui/app";

/**
 * Gerenciar equipe (planejamento, página 16): convidar por código, remover integrante,
 * transferir liderança e sair. Ações de líder aparecem só para o líder.
 */
export default function GerenciarEquipePage() {
  const { equipe, h, meuId, souLider, carregado, carregando, erro, recarregar } = useEquipe();
  const [aviso, setAviso] = useState<{ tone: "ok" | "erro"; title: string } | null>(null);

  async function acao(fn: () => Promise<unknown>, sucesso: string, confirmar?: string) {
    if (confirmar && !confirm(confirmar)) return;
    try {
      await fn();
      setAviso({ tone: "ok", title: sucesso });
      recarregar();
    } catch (e) {
      setAviso({ tone: "erro", title: (e as Error).message });
    }
  }

  return (
    <>
      <PageHeader
        tag="equipe/gerenciar"
        title={equipe ? `Gerenciar ${equipe.nome}` : "Gerenciar equipe"}
        description={h ? `${h.nome} · equipes de ${h.limiteMinIntegrantes} a ${h.limiteMaxIntegrantes} integrantes` : undefined}
        actions={equipe ? <Badge tone={tomSituacaoEquipe[equipe.situacao as keyof typeof tomSituacaoEquipe] ?? "neutro"}>{equipe.situacao}</Badge> : null}
      />

      {aviso ? <div className="mb-6"><Alert tone={aviso.tone} title={aviso.title} /></div> : null}
      {carregando ? <Loading /> : null}
      {erro ? <Alert title={erro.message} /> : null}

      {carregado && !equipe ? (
        <Panel>
          <p className="mb-4 text-[0.9rem] text-muted">Você não participa de nenhuma equipe nesta edição.</p>
          <Link href="/equipe" className="inline-flex h-10 items-center bg-accent px-5 text-[0.8rem] font-bold uppercase !text-[#050706] hover:bg-foreground">Criar ou entrar em uma equipe ↗</Link>
        </Panel>
      ) : null}

      {equipe ? (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Panel title={`Integrantes (${equipe.membros.length}/${h?.limiteMaxIntegrantes ?? "?"})`}>
            {!souLider ? <p className="mb-4 text-[0.85rem] text-muted">Somente o líder remove integrantes e transfere a liderança.</p> : null}
            <Table head={["Nome", "Contato", ""]}>
              {equipe.membros.map((m) => {
                const lider = m.user.id === equipe.liderId;
                return (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.user.nome}</strong> {lider ? <Badge tone="ok">líder</Badge> : null}
                      {m.user.id === meuId ? <span className="ml-2 font-mono text-[0.7rem] text-muted">(você)</span> : null}
                    </td>
                    <td className="text-[0.82rem] text-muted">{m.user.email}</td>
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

          <div className="grid min-w-0 content-start gap-6">
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
