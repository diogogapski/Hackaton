import { prisma } from "@/src/lib/db";
import { badRequest, parseBody, route } from "@/src/lib/http";
import { hashPassword, hashToken } from "@/src/lib/auth/password";
import { inicioNovasSessoes } from "@/src/lib/auth/session";
import { redefinirSenhaSchema } from "@/src/server/identidade/schemas";

export const POST = route(async (request) => {
  const { token, novaSenha } = await parseBody(request, redefinirSenhaSchema);
  const senhaHash = await hashPassword(novaSenha);
  const agora = new Date();

  await prisma.$transaction(async (tx) => {
    const reset = await tx.passwordReset.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { anonimizadoEm: true } } },
    });
    if (!reset || reset.expiraEm < agora || reset.user.anonimizadoEm) throw badRequest("Token inválido ou expirado");

    // Consome o token de forma atômica: uma segunda requisição com o mesmo token não passa.
    const { count } = await tx.passwordReset.updateMany({ where: { id: reset.id, usadoEm: null }, data: { usadoEm: agora } });
    if (count !== 1) throw badRequest("Token inválido ou expirado");

    // Redefinir a senha derruba todas as sessões abertas (ex.: conta comprometida).
    await tx.user.update({ where: { id: reset.userId }, data: { senhaHash, sessoesValidasApos: inicioNovasSessoes() } });
  });

  return Response.json({ ok: true });
});
