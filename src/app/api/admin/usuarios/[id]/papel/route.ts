import { parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { alterarPapel } from "@/src/server/identidade/usuarios";
import { alterarPapelSchema } from "@/src/server/identidade/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = route<Ctx>(async (request, { params }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  const { papel } = await parseBody(request, alterarPapelSchema);
  const user = await alterarPapel(id, papel, admin.id);
  return Response.json({ user });
});
