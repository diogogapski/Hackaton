import { prisma } from "@/src/lib/db";
import { badRequest, parseBody, route } from "@/src/lib/http";
import { publicUserSelect, requireAuth } from "@/src/lib/auth";
import { verifyPassword } from "@/src/lib/auth/password";
import { destroySession } from "@/src/lib/auth/session";
import { excluirContaSchema, perfilUpdateSchema } from "@/src/server/identidade/schemas";
import { anonimizarConta } from "@/src/server/identidade/usuarios";

export const GET = route(async () => {
  const user = await requireAuth();
  return Response.json({ user });
});

export const PUT = route(async (request) => {
  const user = await requireAuth();
  const data = await parseBody(request, perfilUpdateSchema);

  const updated = await prisma.user.update({ where: { id: user.id }, data, select: publicUserSelect });
  return Response.json({ user: updated });
});

/** Exclusão da própria conta (LGPD): confirma a senha, anonimiza os dados e encerra a sessão. */
export const DELETE = route(async (request) => {
  const user = await requireAuth();
  const { senha } = await parseBody(request, excluirContaSchema);

  const { senhaHash } = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { senhaHash: true } });
  if (!(await verifyPassword(senha, senhaHash))) throw badRequest("Senha incorreta");

  await anonimizarConta(user.id);
  await destroySession();
  return Response.json({ ok: true });
});
