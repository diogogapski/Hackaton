import { prisma } from "@/src/lib/db";
import { parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { publicarResultadosSchema } from "@/src/server/hackathon/schemas";

/** Publicação sempre manual. `{ "publicado": false }` despublica. */
export const POST = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId, publicado } = await parseBody(request, publicarResultadosSchema);
  const alvo = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const hackathon = await prisma.hackathon.update({
    where: { id: alvo.id },
    data: { resultadosPublicados: publicado, resultadosPublicadosEm: publicado ? new Date() : null },
    select: { id: true, resultadosPublicados: true, resultadosPublicadosEm: true },
  });
  return Response.json({ hackathon });
});
