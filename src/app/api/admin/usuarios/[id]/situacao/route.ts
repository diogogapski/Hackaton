import { prisma } from "@/src/lib/db";
import { badRequest, parseBody, route } from "@/src/lib/http";
import { publicUserSelect, requireRole } from "@/src/lib/auth";
import { alterarSituacaoUsuarioSchema } from "@/src/server/identidade/schemas";

type Ctx = { params: Promise<{ id: string }> };

/** Bloqueia/desbloqueia conta. Conta bloqueada perde a sessão imediatamente. */
export const PUT = route<Ctx>(async (request, { params }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  const { situacao } = await parseBody(request, alterarSituacaoUsuarioSchema);
  if (id === admin.id && situacao === "BLOQUEADO") throw badRequest("Você não pode bloquear a própria conta");

  const alvo = await prisma.user.findUnique({ where: { id }, select: { anonimizadoEm: true } });
  if (alvo?.anonimizadoEm && situacao === "ATIVO") throw badRequest("Conta anonimizada não pode ser reativada");

  const user = await prisma.user.update({ where: { id }, data: { situacao }, select: publicUserSelect });
  return Response.json({ user });
});
