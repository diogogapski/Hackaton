import { prisma } from "@/src/lib/db";
import { badRequest, parseBody, route } from "@/src/lib/http";
import { hashPassword, hashToken } from "@/src/lib/auth/password";
import { redefinirSenhaSchema } from "@/src/server/identidade/schemas";

export const POST = route(async (request) => {
  const { token, novaSenha } = await parseBody(request, redefinirSenhaSchema);

  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!reset || reset.usadoEm || reset.expiraEm < new Date()) {
    throw badRequest("Token inválido ou expirado");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { senhaHash: await hashPassword(novaSenha) } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usadoEm: new Date() } }),
  ]);

  return Response.json({ ok: true });
});
