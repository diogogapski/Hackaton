import { prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { adminProjetosQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId, situacao } = parseQuery(request, adminProjetosQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const projetos = await prisma.projeto.findMany({
    where: { hackathonId: hackathon.id, situacao },
    orderBy: [{ enviadoEm: "asc" }, { criadoEm: "asc" }],
    include: {
      team: { select: { id: true, nome: true, situacao: true } },
      desafio: { select: { id: true, titulo: true } },
      atribuicoes: { select: { juradoId: true, concluida: true, jurado: { select: { nome: true } } } },
    },
  });
  return Response.json({ projetos });
});
