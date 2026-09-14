"use client";

import { useApi } from "@/src/hooks/useApi";

export type Membro = { id: string; entrouEm: string; user: { id: string; nome: string; email: string; vinculo: string; curso: string | null } };
export type Equipe = { id: string; nome: string; situacao: string; liderId: string | null; codigoConvite: string | null; membros: Membro[] };
export type HackathonEquipe = { nome: string; limiteMinIntegrantes: number; limiteMaxIntegrantes: number; inscricoesAbertas: boolean };

export const tomSituacaoEquipe = { INSCRITA: "ok", EM_FORMACAO: "alerta", DESCLASSIFICADA: "erro" } as const;

/** Dados comuns às telas de equipe: usuário logado, edição e equipe atual. */
export function useEquipe() {
  const eu = useApi<{ user: { id: string } }>("/api/auth/me");
  const hackathon = useApi<{ hackathon: HackathonEquipe }>("/api/hackathon/atual");
  const equipeReq = useApi<{ equipe: Equipe | null }>("/api/equipe");

  const equipe = equipeReq.data?.equipe ?? null;
  const meuId = eu.data?.user.id;
  return {
    equipe,
    h: hackathon.data?.hackathon,
    meuId,
    souLider: Boolean(equipe && meuId && equipe.liderId === meuId),
    carregado: Boolean(equipeReq.data),
    carregando: equipeReq.loading && !equipeReq.data,
    erro: equipeReq.error,
    recarregar: equipeReq.reload,
  };
}
