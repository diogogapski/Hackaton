import { parseBody, route } from "@/src/lib/http";
import { requireAuth } from "@/src/lib/auth";
import { entrarComCodigo } from "@/src/server/equipes/service";
import { entrarEquipeSchema } from "@/src/server/equipes/schemas";

export const POST = route(async (request) => {
  const user = await requireAuth();
  const { codigo } = await parseBody(request, entrarEquipeSchema);
  const equipe = await entrarComCodigo(user, codigo);
  return Response.json({ equipe });
});
