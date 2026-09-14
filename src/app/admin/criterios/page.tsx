"use client";

import { ResourceManager } from "@/src/components/admin/ResourceManager";
import { PageHeader } from "@/src/components/ui/app";

export default function AdminCriteriosPage() {
  return (
    <>
      <PageHeader
        tag="admin/criterios"
        title="Critérios"
        description="Pesos e ordem de desempate. A escala de notas é a mesma para todos os critérios e fica em Edições. Critério com notas não pode ser excluído."
      />
      <ResourceManager
        endpoint="/api/admin/criterios"
        listKey="criterios"
        singular="critério"
        campos={[
          { name: "nome", label: "Nome", required: true },
          { name: "peso", label: "Peso", type: "number", hint: "Padrão 1" },
          { name: "ordem", label: "Ordem de exibição", type: "number" },
          { name: "prioridadeDesempate", label: "Prioridade no desempate", type: "number", nullable: true, hint: "1 desempata primeiro; vazio = não desempata" },
          { name: "descricao", label: "Descrição", type: "textarea", nullable: true },
        ]}
        colunas={[
          { label: "Ordem", render: (c) => String(c.ordem) },
          { label: "Nome", render: (c) => <strong>{String(c.nome)}</strong> },
          { label: "Peso", render: (c) => String(c.peso) },
          { label: "Desempate", render: (c) => (c.prioridadeDesempate == null ? "—" : `${c.prioridadeDesempate}º`) },
        ]}
      />
    </>
  );
}
