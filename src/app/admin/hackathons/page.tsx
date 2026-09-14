"use client";

import { ResourceManager } from "@/src/components/admin/ResourceManager";
import { useHackathon } from "@/src/components/admin/HackathonContext";
import { Badge, formatarData, PageHeader } from "@/src/components/ui/app";

const STATUS = [
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "INSCRICOES_ABERTAS", label: "Inscrições abertas" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "ENCERRADO", label: "Encerrado" },
];

/** Gerenciar Hackathons (planejamento, página 21): edições, datas, limites, regulamento e configurações. */
export default function AdminHackathonsPage() {
  const { recarregarHackathons } = useHackathon();

  return (
    <>
      <PageHeader
        tag="admin/hackathons"
        title="Hackathons"
        description="Tudo o que é regra da edição fica aqui: datas, local, limites de equipe, jurados por projeto, escala de notas e o que aparece publicamente."
      />
      <ResourceManager
        endpoint="/api/admin/hackathons"
        listKey="hackathons"
        singular="edição"
        podeExcluir={false}
        aoSalvar={recarregarHackathons}
        campos={[
          { name: "nome", label: "Nome", required: true },
          { name: "status", label: "Status", type: "select", options: STATUS, required: true },
          { name: "local", label: "Local", nullable: true, hint: "Ex.: IFPR Campus Pinhais" },
          { name: "dataInicio", label: "Início do evento", type: "datetime", required: true },
          { name: "dataFim", label: "Fim do evento", type: "datetime", required: true },
          { name: "inscricaoInicio", label: "Início das inscrições", type: "datetime", nullable: true },
          { name: "inscricaoFim", label: "Fim das inscrições", type: "datetime", nullable: true },
          { name: "prazoSubmissao", label: "Prazo de submissão", type: "datetime", nullable: true, hint: "Vazio = fim do evento" },
          { name: "limiteMinIntegrantes", label: "Mínimo de integrantes", type: "number" },
          { name: "limiteMaxIntegrantes", label: "Máximo de integrantes", type: "number" },
          { name: "juradosPorProjeto", label: "Jurados por projeto", type: "number" },
          { name: "notaMin", label: "Nota mínima (todos os critérios)", type: "number", hint: "Travada após a 1ª avaliação" },
          { name: "notaMax", label: "Nota máxima (todos os critérios)", type: "number" },
          { name: "regulamentoUrl", label: "URL do regulamento", nullable: true },
          { name: "permitirEdicaoAvaliacao", label: "Jurado pode reenviar avaliação", type: "checkbox" },
          { name: "exibirNotasPublicas", label: "Exibir notas no resultado público", type: "checkbox" },
          { name: "exibirEquipesPublicas", label: "Exibir lista de equipes inscritas no site", type: "checkbox" },
          { name: "descricao", label: "Descrição", type: "textarea", required: true },
          { name: "regulamentoTexto", label: "Regulamento (texto)", type: "textarea", nullable: true },
        ]}
        colunas={[
          { label: "Nome", render: (h) => <strong>{String(h.nome)}</strong> },
          { label: "Status", render: (h) => <Badge tone={h.status === "RASCUNHO" ? "neutro" : "ok"}>{String(h.status)}</Badge> },
          { label: "Evento", render: (h) => `${formatarData(h.dataInicio as string)} → ${formatarData(h.dataFim as string)}` },
          { label: "Local", render: (h) => String(h.local ?? "—") },
          { label: "Equipe", render: (h) => `${h.limiteMinIntegrantes}–${h.limiteMaxIntegrantes}` },
          { label: "Escala", render: (h) => `${h.notaMin}–${h.notaMax}` },
          { label: "Resultados", render: (h) => (h.resultadosPublicados ? <Badge tone="ok">publicados</Badge> : <Badge>não publicados</Badge>) },
        ]}
      />
    </>
  );
}
