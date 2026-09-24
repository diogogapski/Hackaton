import { prisma } from "@/src/lib/db";
import { badRequest, conflict, parseBody, route } from "@/src/lib/http";
import { requireAuth } from "@/src/lib/auth";
import { verifyPassword } from "@/src/lib/auth/password";
import { alterarEmailSchema } from "@/src/server/identidade/schemas";
import { emitirVerificacao } from "@/src/server/identidade/verificacao-email";

export const POST = route(async (request) => {
  const user = await requireAuth();
  const { novoEmail, senhaAtual } = await parseBody(request, alterarEmailSchema);
  if (novoEmail === user.email) throw badRequest("Este já é o e-mail da conta");

  const existente = await prisma.user.findUnique({ where: { email: novoEmail }, select: { id: true } });
  if (existente) throw conflict("E-mail já está em uso");

  const registro = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { id: true, nome: true, email: true, senhaHash: true },
  });
  if (!(await verifyPassword(senhaAtual, registro.senhaHash))) throw badRequest("Senha atual incorreta");

  await emitirVerificacao(registro, novoEmail);
  return Response.json({ ok: true });
});
