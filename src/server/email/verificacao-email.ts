import { Resend } from "resend";
import type { ConfiguracaoEmail } from "@/src/server/email/recuperacao-senha";

const semBarraFinal = (valor: string) => valor.replace(/\/+$/, "");
const escaparHtml = (valor: string) => valor.replace(/[&<>'"]/g, (caractere) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
})[caractere]!);

export function linkVerificacao(appUrl: string, token: string) {
  const url = new URL("/verificar-email", `${semBarraFinal(appUrl)}/`);
  url.searchParams.set("token", token);
  return url.toString();
}

export function conteudoVerificacaoEmail(nome: string, link: string, alteracao: boolean) {
  const nomeSeguro = escaparHtml(nome);
  const linkSeguro = escaparHtml(link);
  const acao = alteracao ? "confirmar seu novo e-mail" : "confirmar seu cadastro";
  return {
    subject: alteracao ? "Confirme seu novo e-mail do HACKIF" : "Confirme seu cadastro no HACKIF",
    text: `Olá, ${nome}.\n\nUse o link abaixo para ${acao}. Ele expira em 24 horas e pode ser usado uma única vez.\n\n${link}\n\nSe você não fez esse pedido, ignore este e-mail.`,
    html: `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#080b09;color:#f4f7f2;font-family:Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:40px 24px">
      <p style="margin:0 0 24px;color:#b6ff00;font:700 14px monospace">HACKIF // VERIFICAÇÃO DE E-MAIL</p>
      <h1 style="margin:0 0 18px;font-size:28px">Olá, ${nomeSeguro}</h1>
      <p style="margin:0 0 24px;line-height:1.6;color:#c8cec9">Use o botão abaixo para ${acao}. O link expira em 24 horas e só pode ser usado uma vez.</p>
      <a href="${linkSeguro}" style="display:inline-block;background:#b6ff00;color:#050706;padding:15px 22px;text-decoration:none;font-weight:700">CONFIRMAR E-MAIL</a>
      <p style="margin:28px 0 0;line-height:1.6;color:#8f9991;font-size:14px">Se você não fez esse pedido, ignore este e-mail.</p>
    </div>
  </body>
</html>`,
  };
}

export async function enviarVerificacaoEmail(
  configuracao: ConfiguracaoEmail,
  destinatario: { nome: string; email: string },
  token: string,
  alteracao: boolean,
) {
  const link = linkVerificacao(configuracao.appUrl, token);
  if (configuracao.provedor === "console") {
    console.info(`[verificar-email] ${destinatario.email}: ${link}`);
    return;
  }

  const resend = new Resend(configuracao.apiKey);
  const conteudo = conteudoVerificacaoEmail(destinatario.nome, link, alteracao);
  const { error } = await resend.emails.send({
    from: configuracao.remetente,
    to: destinatario.email,
    subject: conteudo.subject,
    text: conteudo.text,
    html: conteudo.html,
  });
  if (error) throw new Error(`Resend recusou o envio: ${error.message}`);
}
