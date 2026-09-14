import { parseBody, parseQuery, route } from "@/src/lib/http";
import { getCurrentUserTeam, requireAuth } from "@/src/lib/auth";
import { criarEquipe } from "@/src/server/equipes/service";
import { criarEquipeSchema, hackathonQuerySchema } from "@/src/server/equipes/schemas";

/** Equipe do usuário logado (`?hackathonId=` opcional). */
export const GET = route(async (request) => {
  const user = await requireAuth();
  const { hackathonId } = parseQuery(request, hackathonQuerySchema);
  const team = await getCurrentUserTeam(hackathonId);

  // Código de convite só é visível para o líder.
  const equipe = team && team.liderId !== user.id ? { ...team, codigoConvite: null } : team;
  return Response.json({ equipe });
});

export const POST = route(async (request) => {
  const user = await requireAuth();
  const { nome, hackathonId } = await parseBody(request, criarEquipeSchema);
  const equipe = await criarEquipe(user, nome, hackathonId);
  return Response.json({ equipe }, { status: 201 });
});
