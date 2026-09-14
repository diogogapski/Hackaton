import { notFound, route } from "@/src/lib/http";
import { getCurrentUserTeam, requireAuth } from "@/src/lib/auth";
import { regenerarConvite } from "@/src/server/equipes/service";

/** Gera um novo código de convite (invalida o anterior). Só o líder. */
export const POST = route(async () => {
  const user = await requireAuth();
  const team = await getCurrentUserTeam();
  if (!team) throw notFound("Você não participa de uma equipe");

  const convite = await regenerarConvite(user, team.id);
  return Response.json({ convite });
});
