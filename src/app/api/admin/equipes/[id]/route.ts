import { parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { atualizarEquipeAdmin } from "@/src/server/equipes/service";
import { adminAtualizarEquipeSchema } from "@/src/server/equipes/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const data = await parseBody(request, adminAtualizarEquipeSchema);
  const equipe = await atualizarEquipeAdmin(id, data);
  return Response.json({ equipe });
});
