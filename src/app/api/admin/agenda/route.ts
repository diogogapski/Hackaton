import { prisma } from "@/src/lib/db";
import { badRequest, parseBody, parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { agendaCreateSchema, hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const agenda = await prisma.agendaItem.findMany({
    where: { hackathonId: hackathon.id },
    orderBy: { horarioInicio: "asc" },
  });
  return Response.json({ agenda });
});

export const POST = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId, ...data } = await parseBody(request, agendaCreateSchema);
  if (data.horarioFim && data.horarioFim < data.horarioInicio) throw badRequest("horarioFim anterior ao início");
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const item = await prisma.agendaItem.create({ data: { ...data, hackathonId: hackathon.id } });
  return Response.json({ item }, { status: 201 });
});
