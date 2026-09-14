import { prisma } from "@/src/lib/db";
import { notFound } from "@/src/lib/http";

/**
 * Edição vigente: a mais recente com inscrições abertas/em andamento; senão a
 * mais recente não-rascunho. Admin pode incluir rascunhos.
 */
export async function getHackathonAtual({ incluirRascunho = false } = {}) {
  const ativa = await prisma.hackathon.findFirst({
    where: { status: { in: ["INSCRICOES_ABERTAS", "EM_ANDAMENTO"] } },
    orderBy: { dataInicio: "desc" },
  });
  if (ativa) return ativa;

  return prisma.hackathon.findFirst({
    where: incluirRascunho ? {} : { status: { not: "RASCUNHO" } },
    orderBy: { dataInicio: "desc" },
  });
}

/** Resolve `hackathonId` explícito (validando existência) ou cai na edição atual. */
export async function resolveHackathon(hackathonId?: string | null, opts?: { incluirRascunho?: boolean }) {
  const hackathon = hackathonId
    ? await prisma.hackathon.findUnique({ where: { id: hackathonId } })
    : await getHackathonAtual(opts);
  if (!hackathon) throw notFound("Hackathon não encontrado");
  if (!opts?.incluirRascunho && hackathon.status === "RASCUNHO") throw notFound("Hackathon não encontrado");
  return hackathon;
}

export function inscricoesAbertas(h: { status: string; inscricaoInicio: Date | null; inscricaoFim: Date | null }) {
  const agora = new Date();
  if (h.status !== "INSCRICOES_ABERTAS") return false;
  if (h.inscricaoInicio && agora < h.inscricaoInicio) return false;
  if (h.inscricaoFim && agora > h.inscricaoFim) return false;
  return true;
}

export function submissaoAberta(h: { status: string; prazoSubmissao: Date | null; dataFim: Date }) {
  if (h.status !== "INSCRICOES_ABERTAS" && h.status !== "EM_ANDAMENTO") return false;
  return new Date() <= (h.prazoSubmissao ?? h.dataFim);
}
