import { prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });
  const id = hackathon.id;

  const [
    usuarios,
    equipesPorSituacao,
    participantes,
    projetosPorSituacao,
    jurados,
    avaliacoesPendentes,
    avaliacoesConcluidas,
    proximaAgenda,
    comunicadosRecentes,
  ] = await Promise.all([
    prisma.user.count({ where: { papel: "PARTICIPANTE" } }),
    prisma.team.groupBy({ by: ["situacao"], where: { hackathonId: id }, _count: { _all: true } }),
    prisma.teamMember.count({ where: { saiuEm: null, team: { hackathonId: id } } }),
    prisma.projeto.groupBy({ by: ["situacao"], where: { hackathonId: id }, _count: { _all: true } }),
    prisma.user.count({ where: { papel: "JURADO", situacao: "ATIVO" } }),
    prisma.avaliacaoAtribuicao.count({ where: { concluida: false, projeto: { hackathonId: id } } }),
    prisma.avaliacaoAtribuicao.count({ where: { concluida: true, projeto: { hackathonId: id } } }),
    prisma.agendaItem.findMany({
      where: { hackathonId: id, horarioInicio: { gte: new Date() } },
      orderBy: { horarioInicio: "asc" },
      take: 5,
    }),
    prisma.comunicado.findMany({
      where: { hackathonId: id },
      orderBy: { atualizadoEm: "desc" },
      take: 5,
      select: { id: true, titulo: true, conteudo: true, publicadoEm: true, origem: true, atualizadoEm: true },
    }),
  ]);

  const contar = (grupos: { _count: { _all: number } }[]) => grupos.reduce((s, g) => s + g._count._all, 0);
  const porSituacao = <T extends { situacao: string; _count: { _all: number } }>(grupos: T[]) =>
    Object.fromEntries(grupos.map((g) => [g.situacao, g._count._all]));

  return Response.json({
    hackathon: { id, nome: hackathon.nome, status: hackathon.status, resultadosPublicados: hackathon.resultadosPublicados },
    usuariosParticipantes: usuarios,
    equipes: { total: contar(equipesPorSituacao), porSituacao: porSituacao(equipesPorSituacao) },
    participantesEmEquipes: participantes,
    projetos: { total: contar(projetosPorSituacao), porSituacao: porSituacao(projetosPorSituacao) },
    jurados,
    avaliacoes: { pendentes: avaliacoesPendentes, concluidas: avaliacoesConcluidas },
    proximaAgenda,
    comunicadosRecentes,
  });
});
