import { prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

/** Acompanhamento: pendentes/concluídas por jurado e por projeto. */
export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const atribuicoes = await prisma.avaliacaoAtribuicao.findMany({
    where: { projeto: { hackathonId: hackathon.id } },
    include: {
      jurado: { select: { id: true, nome: true } },
      projeto: { select: { id: true, nome: true, team: { select: { nome: true } } } },
    },
  });

  const agrupar = <K extends string>(chave: (a: (typeof atribuicoes)[number]) => K, rotulo: (a: (typeof atribuicoes)[number]) => object) => {
    const mapa = new Map<K, { total: number; concluidas: number; pendentes: number } & object>();
    for (const a of atribuicoes) {
      const k = chave(a);
      const item = mapa.get(k) ?? { ...rotulo(a), total: 0, concluidas: 0, pendentes: 0 };
      item.total += 1;
      if (a.concluida) item.concluidas += 1;
      else item.pendentes += 1;
      mapa.set(k, item);
    }
    return [...mapa.values()];
  };

  return Response.json({
    total: atribuicoes.length,
    concluidas: atribuicoes.filter((a) => a.concluida).length,
    porJurado: agrupar((a) => a.juradoId, (a) => ({ jurado: a.jurado })),
    porProjeto: agrupar((a) => a.projetoId, (a) => ({ projeto: { id: a.projeto.id, nome: a.projeto.nome, equipe: a.projeto.team.nome } })),
  });
});
