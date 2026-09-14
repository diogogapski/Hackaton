import { prisma } from "@/src/lib/db";
import { badRequest, conflict, forbidden, notFound } from "@/src/lib/http";
import { getCurrentUserTeam, requireAuth } from "@/src/lib/auth";
import { resolveHackathon, submissaoAberta } from "@/src/server/hackathon/atual";

/** Contexto do participante: edição, equipe (via helper do Bloco A) e projeto. */
export async function contextoProjeto(hackathonId?: string) {
  await requireAuth();
  const hackathon = await resolveHackathon(hackathonId);
  const equipe = await getCurrentUserTeam(hackathon.id);
  const projeto = equipe ? await prisma.projeto.findUnique({ where: { teamId: equipe.id } }) : null;
  return { hackathon, equipe, projeto };
}

type Ctx = Awaited<ReturnType<typeof contextoProjeto>>;

export async function validarEscrita(
  { hackathon, equipe }: Ctx,
  { desafioId, enviar }: { desafioId?: string | null; enviar?: boolean },
) {
  if (!equipe) throw forbidden("Você precisa participar de uma equipe");
  if (equipe.situacao === "DESCLASSIFICADA") throw forbidden("Equipe desclassificada");
  if (!submissaoAberta(hackathon)) throw badRequest("O prazo de submissão está encerrado");

  if (desafioId) {
    const desafio = await prisma.desafio.findFirst({
      where: { id: desafioId, hackathonId: hackathon.id, publicado: true },
    });
    if (!desafio) throw badRequest("Desafio inválido para esta edição");
  }

  if (enviar && equipe.membros.length < hackathon.limiteMinIntegrantes) {
    throw badRequest(`A equipe precisa de pelo menos ${hackathon.limiteMinIntegrantes} integrantes para enviar`);
  }
}

export function camposDeEnvio(enviar: boolean | undefined, enviadoEm: Date | null) {
  if (!enviar) return {};
  // Mantém a primeira data de envio (usada no desempate).
  return { situacao: "ENVIADO" as const, enviadoEm: enviadoEm ?? new Date() };
}

export async function garantirSemProjeto(ctx: Ctx) {
  if (ctx.projeto) throw conflict("A equipe já possui projeto; use PUT para editar");
}

export function garantirProjeto(ctx: Ctx) {
  if (!ctx.projeto) throw notFound("A equipe ainda não possui projeto");
  if (ctx.projeto.situacao === "DESCLASSIFICADO") throw forbidden("Projeto desclassificado");
  return ctx.projeto;
}
