import { prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

/**
 * Painel público de equipes (canvas: "agenda, equipes e resultado sem login"). Só expõe nome da equipe,
 * quantidade de integrantes e desafio escolhido — nunca nomes de pessoas — e só se a comissão
 * ligar `Hackathon.exibirEquipesPublicas`.
 */
export const GET = route(async (request) => {
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId);

  if (!hackathon.exibirEquipesPublicas) return Response.json({ publico: false, equipes: [] });

  const equipes = await prisma.team.findMany({
    where: { hackathonId: hackathon.id, situacao: "INSCRITA" },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      _count: { select: { membros: { where: { saiuEm: null } } } },
      projeto: { select: { situacao: true, desafio: { select: { titulo: true } } } },
    },
  });

  return Response.json({
    publico: true,
    equipes: equipes.map((e) => ({
      id: e.id,
      nome: e.nome,
      integrantes: e._count.membros,
      desafio: e.projeto?.desafio?.titulo ?? null,
      projetoEnviado: e.projeto?.situacao === "ENVIADO",
    })),
  });
});
