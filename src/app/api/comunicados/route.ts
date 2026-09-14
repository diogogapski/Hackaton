import { prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";

export const GET = route(async (request) => {
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId);

  const comunicados = await prisma.comunicado.findMany({
    where: { hackathonId: hackathon.id, publicadoEm: { not: null, lte: new Date() } },
    select: { id: true, titulo: true, conteudo: true, publicadoEm: true },
    orderBy: { publicadoEm: "desc" },
  });
  return Response.json({ comunicados });
});
