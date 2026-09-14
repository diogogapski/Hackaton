import { prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId);

  const desafios = await prisma.desafio.findMany({
    where: { hackathonId: hackathon.id, publicado: true },
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
  });
  return Response.json({ desafios });
});
