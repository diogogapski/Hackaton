import { prisma } from "@/src/lib/db";
import { parseBody, route } from "@/src/lib/http";
import { createToken } from "@/src/lib/auth/password";
import { clientIp, exigirDentroDoLimite, registrarTentativa } from "@/src/lib/auth/rate-limit";
import { recuperarSenhaSchema } from "@/src/server/identidade/schemas";
import {
  ErroConfiguracaoEmail,
  enviarRecuperacaoSenha,
  obterConfiguracaoEmail,
} from "@/src/server/email/recuperacao-senha";

const VALIDADE_MS = 60 * 60 * 1000;

export const POST = route(async (request) => {
  const { email } = await parseBody(request, recuperarSenhaSchema);

  let configuracao;
  try {
    configuracao = obterConfiguracaoEmail();
  } catch (error) {
    if (error instanceof ErroConfiguracaoEmail) {
      // Sem envio de e-mail configurado, a organização gera o link em /admin/usuarios.
      // A resposta é igual para qualquer e-mail (não revela contas cadastradas).
      console.warn(`[recuperar-senha] envio de e-mail desativado: ${error.message}`);
      return Response.json({ ok: true, envio: "organizacao" });
    }
    throw error;
  }

  const ip = clientIp(request);
  await exigirDentroDoLimite("recuperar-senha", ip);
  await registrarTentativa("recuperar-senha", ip);

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, nome: true, email: true, situacao: true } });

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

    try {
      await enviarRecuperacaoSenha(configuracao, user, token);
    } catch (error) {
      // A resposta continua genérica para não revelar quais e-mails existem.
      await prisma.passwordReset.updateMany({
        where: { tokenHash, usadoEm: null },
        data: { usadoEm: new Date() },
      }).catch(() => {});
      console.error("[recuperar-senha] não foi possível enviar o e-mail", error);
    }
  }

  // Resposta igual exista ou não a conta (não revela e-mails cadastrados).
  return Response.json({ ok: true });
});
