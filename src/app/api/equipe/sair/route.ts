import { notFound, route } from "@/src/lib/http";
import { getCurrentUserTeam, requireAuth } from "@/src/lib/auth";
import { sairDaEquipe } from "@/src/server/equipes/service";

/** Sai da equipe atual. Se for o líder, o membro mais antigo é promovido. */
export const POST = route(async () => {
  const user = await requireAuth();
  const team = await getCurrentUserTeam();
  if (!team) throw notFound("Você não participa de uma equipe");

  await sairDaEquipe(user, team.id);
  return Response.json({ ok: true });
});
