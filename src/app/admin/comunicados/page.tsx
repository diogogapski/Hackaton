"use client";

import { ResourceManager } from "@/src/components/admin/ResourceManager";
import { Badge, formatarData, PageHeader } from "@/src/components/ui/app";

export default function AdminComunicadosPage() {
  return (
    <>
      <PageHeader tag="admin/comunicados" title="Comunicados" description="Avisos da edição. Só os publicados aparecem para o público." />
      <ResourceManager
        endpoint="/api/admin/comunicados"
        listKey="comunicados"
        singular="comunicado"
        campos={[
          { name: "titulo", label: "Título", required: true },
          { name: "publicar", label: "Publicado", type: "checkbox", valorInicial: (c) => Boolean(c.publicadoEm) },
          { name: "conteudo", label: "Conteúdo", type: "textarea", required: true },
        ]}
        colunas={[
          { label: "Título", render: (c) => <strong>{String(c.titulo)}</strong> },
          { label: "Autor", render: (c) => (c.autor as { nome: string } | null)?.nome ?? "—" },
          { label: "Status", render: (c) => (c.publicadoEm ? <Badge tone="ok">publicado {formatarData(c.publicadoEm as string)}</Badge> : <Badge>rascunho</Badge>) },
        ]}
      />
    </>
  );
}
