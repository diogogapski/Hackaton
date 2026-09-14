import { prisma } from "@/src/lib/db";
import { parseBody, parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { comunicadoCreateSchema, hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const comunicados = await prisma.comunicado.findMany({
    where: { hackathonId: hackathon.id },
    include: { autor: { select: { id: true, nome: true } } },
    orderBy: { criadoEm: "desc" },
  });
  return Response.json({ comunicados });
});

export const POST = route(async (request) => {
  const admin = await requireRole("ADMIN");
  const { hackathonId, publicar, ...data } = await parseBody(request, comunicadoCreateSchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const comunicado = await prisma.comunicado.create({
    data: { ...data, hackathonId: hackathon.id, autorId: admin.id, publicadoEm: publicar ? new Date() : null },
  });
  return Response.json({ comunicado }, { status: 201 });
});
