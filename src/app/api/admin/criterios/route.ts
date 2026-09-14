import { prisma } from "@/src/lib/db";
import { parseBody, parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { criterioCreateSchema, hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const criterios = await prisma.criterio.findMany({
    where: { hackathonId: hackathon.id },
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
  });
  return Response.json({ criterios });
});

export const POST = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId, ...data } = await parseBody(request, criterioCreateSchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const criterio = await prisma.criterio.create({ data: { ...data, hackathonId: hackathon.id } });
  return Response.json({ criterio }, { status: 201 });
});
