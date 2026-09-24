// Rate limit persistido no banco (tabela TentativaAcesso): vale com várias
// instâncias e sobrevive a reinícios.
import { prisma } from "@/src/lib/db";
import { HttpError } from "@/src/lib/http";
import { createHash } from "node:crypto";
import { isIP } from "node:net";

type Limite = { max: number; janelaMinutos: number };

const numeroEnv = (nome: string, padrao: number) => {
  const valor = Number(process.env[nome]);
  return Number.isFinite(valor) && valor > 0 ? valor : padrao;
};

// Laboratórios do campus podem sair pelo mesmo IP (NAT): limites folgados por padrão.
export const LIMITES = {
  login: {
    max: numeroEnv("LOGIN_MAX_TENTATIVAS_POR_IP", 20),
    janelaMinutos: numeroEnv("LOGIN_JANELA_MINUTOS", 15),
  },
  "login-conta": {
    max: numeroEnv("LOGIN_MAX_TENTATIVAS_POR_CONTA", 30),
    janelaMinutos: 60,
  },
  cadastro: {
    max: numeroEnv("CADASTRO_MAX_POR_IP", 50),
    janelaMinutos: 60,
  },
  "recuperar-senha": {
    max: numeroEnv("RECUPERAR_SENHA_MAX_POR_IP", 5),
    janelaMinutos: 60,
  },
  "recuperar-senha-conta": {
    max: numeroEnv("RECUPERAR_SENHA_MAX_POR_CONTA", 5),
    janelaMinutos: 60,
  },
  "verificar-email": {
    max: numeroEnv("VERIFICAR_EMAIL_MAX_POR_IP", 5),
    janelaMinutos: 60,
  },
  "confirmar-email": {
    max: numeroEnv("CONFIRMAR_EMAIL_MAX_POR_IP", 20),
    janelaMinutos: 60,
  },
} satisfies Record<string, Limite>;

export type AcaoLimitada = keyof typeof LIMITES;

const inicioJanela = (acao: AcaoLimitada) => new Date(Date.now() - LIMITES[acao].janelaMinutos * 60 * 1000);

/** Lança 429 se o IP já atingiu o limite de tentativas da ação na janela. */
export async function exigirDentroDoLimite(acao: AcaoLimitada, ip: string) {
  const tentativas = await prisma.tentativaAcesso.count({
    where: { acao, ip, criadoEm: { gte: inicioJanela(acao) } },
  });
  if (tentativas >= LIMITES[acao].max) {
    throw new HttpError(429, `Muitas tentativas deste IP. Tente novamente em até ${LIMITES[acao].janelaMinutos} minutos`);
  }
}

export async function registrarTentativa(acao: AcaoLimitada, ip: string) {
  await prisma.$transaction([
    prisma.tentativaAcesso.create({ data: { acao, ip } }),
    // Limpeza oportunista: nada fica guardado além de 24h.
    prisma.tentativaAcesso.deleteMany({ where: { criadoEm: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
  ]);
}

export function clientIp(request: Request) {
  const encaminhados = request.headers.get("x-forwarded-for")?.split(",").map((ip) => ip.trim()).filter(Boolean) ?? [];
  const candidatos = [...encaminhados.reverse(), request.headers.get("x-real-ip") ?? ""];
  return candidatos.find((ip) => isIP(ip)) ?? "local";
}

/** Chave opaca para limitar uma conta sem guardar e-mail, matrícula ou CPF na tabela de tentativas. */
export const rateLimitKey = (valor: string) => createHash("sha256").update(valor.trim().toLowerCase()).digest("hex");
