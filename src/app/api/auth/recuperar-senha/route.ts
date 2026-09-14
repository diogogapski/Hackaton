import { prisma } from "@/src/lib/db";
import { parseBody, route } from "@/src/lib/http";
import { createToken } from "@/src/lib/auth/password";
import { clientIp, exigirDentroDoLimite, registrarTentativa } from "@/src/lib/auth/rate-limit";
import { recuperarSenhaSchema } from "@/src/server/identidade/schemas";

const VALIDADE_MS = 60 * 60 * 1000;

/**
 * Sem envio de e-mail (fora do escopo). O token é gerado e, apenas em
 * desenvolvimento, o link aparece no console — nunca nos logs de produção.
 */
export const POST = route(async (request) => {
  const { email } = await parseBody(request, recuperarSenhaSchema);

  const ip = clientIp(request);
  await exigirDentroDoLimite("recuperar-senha", ip);
  await registrarTentativa("recuperar-senha", ip);

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, situacao: true } });

  if (user && user.situacao === "ATIVO") {
    const { token, tokenHash } = createToken();
    await prisma.$transaction([
      prisma.passwordReset.updateMany({
        where: { userId: user.id, usadoEm: null },
        data: { usadoEm: new Date() },
      }),
      prisma.passwordReset.create({
        data: { userId: user.id, tokenHash, expiraEm: new Date(Date.now() + VALIDADE_MS) },
      }),
    ]);

    if (process.env.NODE_ENV !== "production") {
      const base = process.env.APP_URL ?? "http://localhost:3000";
      console.info(`[recuperar-senha] ${email}: ${base}/redefinir-senha?token=${token}`);
    }
  }

  // Resposta igual exista ou não a conta (não revela e-mails cadastrados).
  return Response.json({ ok: true });
});
