import { prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId);

  const agenda = await prisma.agendaItem.findMany({
    where: { hackathonId: hackathon.id },
    orderBy: { horarioInicio: "asc" },
  });
  return Response.json({ agenda });
});
