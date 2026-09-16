import { Resend } from "resend";

type AmbienteEmail = Record<string, string | undefined>;

export type ConfiguracaoEmail =
  | { provedor: "console"; appUrl: string }
  | { provedor: "resend"; appUrl: string; apiKey: string; remetente: string };

export class ErroConfiguracaoEmail extends Error {}

function semBarraFinal(valor: string) {
  return valor.replace(/\/+$/, "");
}

export function obterConfiguracaoEmail(env: AmbienteEmail = process.env): ConfiguracaoEmail {
  const provedor = env.EMAIL_PROVIDER?.trim().toLowerCase()
    ?? (env.NODE_ENV === "production" ? "resend" : "console");
  const appUrl = env.APP_URL?.trim()
    || (env.RAILWAY_PUBLIC_DOMAIN ? `https://${env.RAILWAY_PUBLIC_DOMAIN}` : "");

  if (provedor !== "console" && provedor !== "resend") {
    throw new ErroConfiguracaoEmail("EMAIL_PROVIDER deve ser resend ou console");
  }
  if (!appUrl && provedor === "resend") {
    throw new ErroConfiguracaoEmail("APP_URL ou RAILWAY_PUBLIC_DOMAIN é obrigatório para enviar e-mails");
  }
  if (provedor === "console") {
    return { provedor, appUrl: semBarraFinal(appUrl || "http://localhost:3000") };
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const remetente = env.EMAIL_FROM?.trim();
  if (!apiKey || !remetente) {
    throw new ErroConfiguracaoEmail("RESEND_API_KEY e EMAIL_FROM são obrigatórios");
  }
  return { provedor, appUrl: semBarraFinal(appUrl), apiKey, remetente };
}

export function linkRedefinicao(appUrl: string, token: string) {
  const url = new URL("/redefinir-senha", `${semBarraFinal(appUrl)}/`);
  url.searchParams.set("token", token);
  return url.toString();
}

const escaparHtml = (valor: string) => valor.replace(/[&<>'"]/g, (caractere) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
})[caractere]!);

export function conteudoRecuperacaoSenha(nome: string, link: string) {
  const nomeSeguro = escaparHtml(nome);
  const linkSeguro = escaparHtml(link);
  return {
    subject: "Redefina sua senha do HACKIF",
    text: `Olá, ${nome}.\n\nUse o link abaixo para redefinir sua senha do HACKIF. Ele expira em 1 hora e pode ser usado uma única vez.\n\n${link}\n\nSe você não fez esse pedido, ignore este e-mail.`,
    html: `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#080b09;color:#f4f7f2;font-family:Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:40px 24px">
      <p style="margin:0 0 24px;color:#b6ff00;font:700 14px monospace">HACKIF // RECUPERAÇÃO DE SENHA</p>
      <h1 style="margin:0 0 18px;font-size:28px">Olá, ${nomeSeguro}</h1>
      <p style="margin:0 0 24px;line-height:1.6;color:#c8cec9">Recebemos um pedido para redefinir sua senha. O link expira em 1 hora e pode ser usado uma única vez.</p>
      <a href="${linkSeguro}" style="display:inline-block;background:#b6ff00;color:#050706;padding:15px 22px;text-decoration:none;font-weight:700">REDEFINIR SENHA</a>
      <p style="margin:28px 0 0;line-height:1.6;color:#8f9991;font-size:14px">Se você não fez esse pedido, ignore este e-mail. Sua senha continuará a mesma.</p>
    </div>
  </body>
</html>`,
  };
}

export async function enviarRecuperacaoSenha(
  configuracao: ConfiguracaoEmail,
  destinatario: { nome: string; email: string },
  token: string,
) {
  const link = linkRedefinicao(configuracao.appUrl, token);
  if (configuracao.provedor === "console") {
    console.info(`[recuperar-senha] ${destinatario.email}: ${link}`);
    return;
  }

  const resend = new Resend(configuracao.apiKey);
  const conteudo = conteudoRecuperacaoSenha(destinatario.nome, link);
  const { error } = await resend.emails.send({
    from: configuracao.remetente,
    to: destinatario.email,
    subject: conteudo.subject,
    text: conteudo.text,
    html: conteudo.html,
  });
  if (error) throw new Error(`Resend recusou o envio: ${error.message}`);
}
