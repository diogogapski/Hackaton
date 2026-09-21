import { prisma } from "@/src/lib/db";
import { createToken, hashToken } from "@/src/lib/auth/password";
import { inicioNovasSessoes } from "@/src/lib/auth/session";
import { conflict, HttpError, badRequest } from "@/src/lib/http";
import {
  ErroConfiguracaoEmail,
  obterConfiguracaoEmail,
  type ConfiguracaoEmail,
} from "@/src/server/email/recuperacao-senha";
import { enviarVerificacaoEmail } from "@/src/server/email/verificacao-email";

const VALIDADE_MS = 24 * 60 * 60 * 1000;

export function configuracaoEmailObrigatoria(): ConfiguracaoEmail {
  try {
    return obterConfiguracaoEmail();
  } catch (error) {
    if (error instanceof ErroConfiguracaoEmail) {
      console.error(`[email] configuração inválida: ${error.message}`);
      throw new HttpError(503, "Envio de e-mail temporariamente indisponível");
    }
    throw error;
  }
}

export async function emitirVerificacao(
  user: { id: string; nome: string; email: string },
  novoEmail: string,
  configuracao = configuracaoEmailObrigatoria(),
) {
  const { token, tokenHash } = createToken();
  await prisma.$transaction([
    prisma.emailVerification.updateMany({
      where: { userId: user.id, usadoEm: null },
      data: { usadoEm: new Date() },
    }),
    prisma.emailVerification.create({
      data: { userId: user.id, email: novoEmail, tokenHash, expiraEm: new Date(Date.now() + VALIDADE_MS) },
    }),
  ]);

  try {
    await enviarVerificacaoEmail(configuracao, { nome: user.nome, email: novoEmail }, token, user.email !== novoEmail);
  } catch (error) {
    await prisma.emailVerification.updateMany({
      where: { tokenHash, usadoEm: null },
      data: { usadoEm: new Date() },
    }).catch(() => {});
    console.error("[verificar-email] não foi possível enviar o e-mail", error);
    throw new HttpError(503, "Não foi possível enviar o e-mail de confirmação");
  }
}

export async function confirmarEmail(token: string) {
  const agora = new Date();
  return prisma.$transaction(async (tx) => {
    const verificacao = await tx.emailVerification.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, email: true, anonimizadoEm: true } } },
    });
    if (!verificacao || verificacao.expiraEm < agora || verificacao.user.anonimizadoEm) {
      throw badRequest("Token inválido ou expirado");
    }

    const { count } = await tx.emailVerification.updateMany({
      where: { id: verificacao.id, usadoEm: null },
      data: { usadoEm: agora },
    });
    if (count !== 1) throw badRequest("Token inválido ou expirado");

    const emUso = await tx.user.findUnique({ where: { email: verificacao.email }, select: { id: true } });
    if (emUso && emUso.id !== verificacao.userId) throw conflict("E-mail já está em uso");

    await tx.user.update({
      where: { id: verificacao.userId },
      data: {
        email: verificacao.email,
        emailVerificadoEm: agora,
        sessoesValidasApos: inicioNovasSessoes(),
      },
    });
    await tx.emailVerification.updateMany({
      where: { userId: verificacao.userId, usadoEm: null },
      data: { usadoEm: agora },
    });
    return { email: verificacao.email };
  });
}
