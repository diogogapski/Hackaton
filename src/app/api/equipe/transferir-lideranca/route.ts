import { notFound, parseBody, route } from "@/src/lib/http";
import { getCurrentUserTeam, requireAuth } from "@/src/lib/auth";
import { transferirLideranca } from "@/src/server/equipes/service";
import { transferirLiderancaSchema } from "@/src/server/equipes/schemas";

export const POST = route(async (request) => {
  const user = await requireAuth();
  const { userId } = await parseBody(request, transferirLiderancaSchema);
  const team = await getCurrentUserTeam();
  if (!team) throw notFound("Você não participa de uma equipe");

  const equipe = await transferirLideranca(user, team.id, userId);
  return Response.json({ equipe });
});
