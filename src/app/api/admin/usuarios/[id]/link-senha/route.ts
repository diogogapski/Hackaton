import { prisma } from "@/src/lib/db";
import { conflict, notFound, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { createToken } from "@/src/lib/auth/password";

type Ctx = { params: Promise<{ id: string }> };

const VALIDADE_HORAS = 24;

/**
 * A organização gera um link de redefinição de senha para uma conta (quem esqueceu a senha e o envio
 * de e-mail não está ativo). Invalida links anteriores; o link vale 24 horas e é de uso único.
 */
export const POST = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, nome: true, situacao: true, anonimizadoEm: true } });
  if (!user) throw notFound("Usuário não encontrado");
  if (user.anonimizadoEm) throw conflict("Conta anonimizada não pode redefinir senha");
  if (user.situacao !== "ATIVO") throw conflict("Desbloqueie a conta antes de gerar o link");

  const { token, tokenHash } = createToken();
  await prisma.$transaction([
    prisma.passwordReset.updateMany({ where: { userId: user.id, usadoEm: null }, data: { usadoEm: new Date() } }),
    prisma.passwordReset.create({ data: { userId: user.id, tokenHash, expiraEm: new Date(Date.now() + VALIDADE_HORAS * 36e5) } }),
  ]);

  const base = process.env.APP_URL ?? new URL(request.url).origin;
  return Response.json({ link: `${base.replace(/\/+$/, "")}/redefinir-senha?token=${token}`, expiraEmHoras: VALIDADE_HORAS }, { status: 201 });
});
