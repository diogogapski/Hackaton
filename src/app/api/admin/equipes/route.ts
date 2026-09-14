import { prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { requireRole, teamWithMembersInclude } from "@/src/lib/auth";
import { adminEquipesQuerySchema } from "@/src/server/equipes/schemas";

export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId, situacao, q, page, pageSize } = parseQuery(request, adminEquipesQuerySchema);

  const where = { hackathonId, situacao, ...(q && { nome: { contains: q } }) };

  const [total, equipes] = await prisma.$transaction([
    prisma.team.count({ where }),
    prisma.team.findMany({
      where,
      include: {
        ...teamWithMembersInclude,
        hackathon: { select: { id: true, nome: true } },
        // Projeto pertence ao Bloco B; aqui só expomos o relacionamento.
        projeto: { select: { id: true, nome: true, situacao: true } },
      },
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return Response.json({ equipes, total, page, pageSize });
});
