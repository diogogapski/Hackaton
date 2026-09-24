import { prisma } from "@/src/lib/db";
import { parseBody, route } from "@/src/lib/http";
import { clientIp, exigirDentroDoLimite, rateLimitKey, registrarTentativa } from "@/src/lib/auth/rate-limit";
import { reenviarVerificacaoSchema } from "@/src/server/identidade/schemas";
import { emitirVerificacao } from "@/src/server/identidade/verificacao-email";

export const POST = route(async (request) => {
  const { email } = await parseBody(request, reenviarVerificacaoSchema);
  const ip = clientIp(request);
  const conta = rateLimitKey(email);
  await Promise.all([
    exigirDentroDoLimite("verificar-email", ip),
    exigirDentroDoLimite("verificar-email", conta),
  ]);
  await Promise.all([
    registrarTentativa("verificar-email", ip),
    registrarTentativa("verificar-email", conta),
  ]);

  const pendente = await prisma.emailVerification.findFirst({
    where: { email, usadoEm: null, user: { situacao: "ATIVO", anonimizadoEm: null } },
    orderBy: { criadoEm: "desc" },
    include: { user: { select: { id: true, nome: true, email: true, emailVerificadoEm: true } } },
  });
  if (pendente && (pendente.user.email !== email || !pendente.user.emailVerificadoEm)) {
    await emitirVerificacao(pendente.user, email);
  }

  return Response.json({ ok: true });
});
