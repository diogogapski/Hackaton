"use client";

import { ResourceManager } from "@/src/components/admin/ResourceManager";
import { Badge, formatarData, PageHeader } from "@/src/components/ui/app";

/** Gerenciar agenda (planejamento, página 28): criar, editar, cancelar e reorganizar atividades. */
export default function AdminAgendaPage() {
  return (
    <>
      <PageHeader
        tag="admin/agenda"
        title="Agenda"
        description="Programação do evento, em ordem de horário. Cancelar mantém a atividade visível e riscada na agenda pública, para avisar quem já tinha visto; para reorganizar, altere os horários."
      />
      <ResourceManager
        endpoint="/api/admin/agenda"
        listKey="agenda"
        singular="item"
        campos={[
          { name: "titulo", label: "Atividade", required: true },
          { name: "local", label: "Local", nullable: true },
          { name: "horarioInicio", label: "Início", type: "datetime", required: true },
          { name: "horarioFim", label: "Fim", type: "datetime", nullable: true },
          { name: "cancelado", label: "Atividade cancelada (continua visível, riscada)", type: "checkbox" },
          { name: "observacoes", label: "Observações", type: "textarea", nullable: true },
        ]}
        colunas={[
          { label: "Início", render: (i) => formatarData(i.horarioInicio as string) },
          { label: "Fim", render: (i) => formatarData(i.horarioFim as string) },
          { label: "Atividade", render: (i) => <span className={i.cancelado ? "line-through opacity-60" : ""}><strong>{String(i.titulo)}</strong></span> },
          { label: "Local", render: (i) => String(i.local ?? "—") },
          { label: "Situação", render: (i) => (i.cancelado ? <Badge tone="erro">cancelado</Badge> : <Badge tone="ok">confirmado</Badge>) },
        ]}
      />
    </>
  );
}
