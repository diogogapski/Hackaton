import { prisma } from "@/src/lib/db";
import { badRequest, parseBody, route } from "@/src/lib/http";
import { requireAuth } from "@/src/lib/auth";
import { hashPassword, verifyPassword } from "@/src/lib/auth/password";
import { trocarSenhaSchema } from "@/src/server/identidade/schemas";

export const PUT = route(async (request) => {
  const user = await requireAuth();
  const { senhaAtual, novaSenha } = await parseBody(request, trocarSenhaSchema);

  const { senhaHash } = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { senhaHash: true } });
  if (!(await verifyPassword(senhaAtual, senhaHash))) throw badRequest("Senha atual incorreta");

  await prisma.user.update({ where: { id: user.id }, data: { senhaHash: await hashPassword(novaSenha) } });
  return Response.json({ ok: true });
});
