"use client";

import { ResourceManager } from "@/src/components/admin/ResourceManager";
import { formatarData, PageHeader } from "@/src/components/ui/app";

export default function AdminAgendaPage() {
  return (
    <>
      <PageHeader tag="admin/agenda" title="Agenda" description="Programação do evento, exibida em ordem de horário." />
      <ResourceManager
        endpoint="/api/admin/agenda"
        listKey="agenda"
        singular="item"
        campos={[
          { name: "titulo", label: "Atividade", required: true },
          { name: "local", label: "Local", nullable: true },
          { name: "horarioInicio", label: "Início", type: "datetime", required: true },
          { name: "horarioFim", label: "Fim", type: "datetime", nullable: true },
          { name: "observacoes", label: "Observações", type: "textarea", nullable: true },
        ]}
        colunas={[
          { label: "Início", render: (i) => formatarData(i.horarioInicio as string) },
          { label: "Fim", render: (i) => formatarData(i.horarioFim as string) },
          { label: "Atividade", render: (i) => <strong>{String(i.titulo)}</strong> },
          { label: "Local", render: (i) => String(i.local ?? "—") },
        ]}
      />
    </>
  );
}
