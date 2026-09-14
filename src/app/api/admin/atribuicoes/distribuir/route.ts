import { parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";
import { distribuirAutomaticamente } from "@/src/server/avaliacao/atribuicoes";

export const POST = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });
  return Response.json(await distribuirAutomaticamente(hackathon.id));
});
