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

  // Andamento em números: sempre público, porque não identifica ninguém (briefing: "um lugar único onde
  // todo mundo possa acompanhar o andamento").
  const [inscritas, emEspera, projetosEnviados] = await Promise.all([
    prisma.team.count({ where: { hackathonId: hackathon.id, situacao: "INSCRITA" } }),
    prisma.team.count({ where: { hackathonId: hackathon.id, situacao: "LISTA_ESPERA" } }),
    prisma.projeto.count({ where: { hackathonId: hackathon.id, situacao: "ENVIADO" } }),
  ]);
  const resumo = {
    equipesInscritas: inscritas,
    limiteEquipes: hackathon.limiteEquipes,
    equipesEmEspera: emEspera,
    projetosEnviados,
    resultadosPublicados: hackathon.resultadosPublicados,
  };

  if (!hackathon.exibirEquipesPublicas) return Response.json({ publico: false, resumo, equipes: [] });

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
    resumo,
    equipes: equipes.map((e) => ({
      id: e.id,
      nome: e.nome,
      integrantes: e._count.membros,
      desafio: e.projeto?.desafio?.titulo ?? null,
      projetoEnviado: e.projeto?.situacao === "ENVIADO",
    })),
  });
});
