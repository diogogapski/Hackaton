"use client";

import Link from "next/link";
import { useApi } from "@/src/hooks/useApi";
import { Alert, Badge, Empty, formatarData, Loading, PageHeader } from "@/src/components/ui/app";

type Projeto = {
  id: string;
  nome: string;
  descricao: string;
  enviadoEm: string | null;
  team: { nome: string };
  desafio: { titulo: string } | null;
  status: "PENDENTE" | "CONCLUIDA";
  concluidaEm: string | null;
};

export default function JuradoPage() {
  const { data, error, loading } = useApi<{ projetos: Projeto[] }>("/api/jurado/projetos");
  const pendentes = data?.projetos.filter((p) => p.status === "PENDENTE").length ?? 0;

  return (
    <>
      <PageHeader
        tag="jurado/projetos"
        title="Projetos atribuídos"
        description={data ? `${pendentes} pendente(s) de ${data.projetos.length}` : undefined}
      />
      {loading && !data ? <Loading /> : null}
      {error ? <Alert title={error.message} /> : null}
      {data?.projetos.length === 0 ? <Empty>Nenhum projeto atribuído ainda</Empty> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.projetos.map((p) => (
          <Link
            key={p.id}
            href={`/jurado/avaliacao/${p.id}`}
            className="group flex flex-col border border-foreground/10 p-5 transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[0.7rem] uppercase text-muted">{p.team.nome}</span>
              <Badge tone={p.status === "CONCLUIDA" ? "ok" : "alerta"}>{p.status === "CONCLUIDA" ? "avaliado" : "pendente"}</Badge>
            </div>
            <h2 className="mt-3 font-display text-[1.3rem] font-semibold uppercase leading-tight group-hover:text-accent">{p.nome}</h2>
            <p className="mt-2 line-clamp-3 text-[0.88rem] text-foreground/70">{p.descricao}</p>
            <div className="mt-auto pt-4 font-mono text-[0.7rem] uppercase text-muted">
              {p.desafio?.titulo ?? "sem desafio"} · {p.status === "CONCLUIDA" ? `avaliado ${formatarData(p.concluidaEm)}` : `enviado ${formatarData(p.enviadoEm)}`}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
