import { prisma } from "@/src/lib/db";
import { parseBody, parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { desafioCreateSchema, hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const desafios = await prisma.desafio.findMany({
    where: { hackathonId: hackathon.id },
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
    include: { _count: { select: { projetos: true } } },
  });
  return Response.json({ desafios });
});

export const POST = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId, ...data } = await parseBody(request, desafioCreateSchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const desafio = await prisma.desafio.create({ data: { ...data, hackathonId: hackathon.id } });
  return Response.json({ desafio }, { status: 201 });
});
