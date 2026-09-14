import { prisma } from "@/src/lib/db";
import { notFound, parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";
import { gerarResultados } from "@/src/server/avaliacao/resultados";
import { paraCsv, participantesDaEdicao } from "@/src/server/operacao/relatorio";

type Ctx = { params: Promise<{ tipo: string }> };

const geradores: Record<string, (hackathonId: string) => Promise<Record<string, unknown>[]>> = {
  // Contém dados pessoais: só admin, para a lista de presença/crachás.
  participantes: async (id) =>
    (await participantesDaEdicao(id)).map((p) => ({
      nome: p.nome,
      email: p.email,
      vinculo: p.vinculo,
      curso: p.curso ?? "",
      equipe: p.equipe.nome,
      situacao_equipe: p.equipe.situacao,
      lider: p.lider ? "sim" : "não",
      presente: p.presente ? "sim" : "não",
    })),
  equipes: async (id) =>
    (await prisma.team.findMany({
      where: { hackathonId: id },
      orderBy: { nome: "asc" },
      select: {
        nome: true,
        situacao: true,
        completaEm: true,
        lider: { select: { nome: true } },
        _count: { select: { membros: { where: { saiuEm: null } } } },
        projeto: { select: { nome: true, situacao: true, enviadoEm: true, desafio: { select: { titulo: true } } } },
      },
    })).map((e) => ({
      equipe: e.nome,
      situacao: e.situacao,
      integrantes: e._count.membros,
      lider: e.lider?.nome ?? "",
      projeto: e.projeto?.nome ?? "",
      situacao_projeto: e.projeto?.situacao ?? "",
      desafio: e.projeto?.desafio?.titulo ?? "",
      enviado_em: e.projeto?.enviadoEm ?? "",
    })),
  resultado: async (id) => {
    const { criterios, ranking } = await gerarResultados(id);
    return ranking.map((l) => ({
      posicao: l.posicao ?? "",
      projeto: l.projeto.nome,
      equipe: l.equipe.nome,
      nota_final: l.notaFinal ?? "",
      jurados: l.jurados,
      ...Object.fromEntries(criterios.map((c) => [`media_${c.nome}`, l.mediasPorCriterio[c.id] ?? ""])),
    }));
  },
};

/** Exporta CSV (participantes, equipes ou resultado) para a coordenação. */
export const GET = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { tipo } = await params;
  const gerar = geradores[tipo.replace(/\.csv$/, "")];
  if (!gerar) throw notFound("Relatório inexistente (use participantes, equipes ou resultado)");

  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });
  const csv = paraCsv(await gerar(hackathon.id));

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="hackif-${tipo.replace(/\.csv$/, "")}.csv"`,
      "cache-control": "no-store",
    },
  });
});
