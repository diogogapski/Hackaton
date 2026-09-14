"use client";

import { ResourceManager } from "@/src/components/admin/ResourceManager";
import { Badge, PageHeader } from "@/src/components/ui/app";

export default function AdminDesafiosPage() {
  return (
    <>
      <PageHeader tag="admin/desafios" title="Desafios" description="Propostas da edição. Só os publicados aparecem na área pública e na submissão de projeto." />
      <ResourceManager
        endpoint="/api/admin/desafios"
        listKey="desafios"
        singular="desafio"
        campos={[
          { name: "titulo", label: "Título", required: true },
          { name: "categoria", label: "Categoria", nullable: true },
          { name: "responsavel", label: "Responsável", nullable: true },
          { name: "ordem", label: "Ordem", type: "number" },
          { name: "descricao", label: "Descrição", type: "textarea", required: true },
          { name: "publicado", label: "Publicado", type: "checkbox" },
        ]}
        colunas={[
          { label: "Ordem", render: (d) => String(d.ordem) },
          { label: "Título", render: (d) => <strong>{String(d.titulo)}</strong> },
          { label: "Categoria", render: (d) => String(d.categoria ?? "—") },
          { label: "Projetos", render: (d) => String((d._count as { projetos: number })?.projetos ?? 0) },
          { label: "Status", render: (d) => (d.publicado ? <Badge tone="ok">publicado</Badge> : <Badge>rascunho</Badge>) },
        ]}
      />
    </>
  );
}
