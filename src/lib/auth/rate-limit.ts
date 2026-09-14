// Rate limit por IP persistido no banco (tabela TentativaAcesso): vale com várias
// instâncias e sobrevive a reinícios. Só tentativas malsucedidas são registradas.
import { prisma } from "@/src/lib/db";
import { HttpError } from "@/src/lib/http";

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
  "recuperar-senha": {
    max: numeroEnv("RECUPERAR_SENHA_MAX_POR_IP", 5),
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
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
