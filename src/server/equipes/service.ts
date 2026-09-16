import { randomBytes } from "node:crypto";
import { prisma } from "@/src/lib/db";
import { badRequest, conflict, forbidden, notFound } from "@/src/lib/http";
import { teamWithMembersInclude, type CurrentUser } from "@/src/lib/auth";
import { inscricoesAbertas, resolveHackathon } from "@/src/server/hackathon/atual";
import type { Prisma } from "@/src/generated/prisma/client";

type Tx = Prisma.TransactionClient;

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function gerarCodigoConvite(tamanho = 8) {
  const bytes = randomBytes(tamanho);
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

export const buscarEquipe = (teamId: string) =>
  prisma.team.findUnique({ where: { id: teamId }, include: teamWithMembersInclude });

async function membroAtivo(tx: Tx, userId: string, hackathonId: string) {
  return tx.teamMember.findFirst({ where: { userId, saiuEm: null, team: { hackathonId } } });
}

/**
 * Preenche as vagas de INSCRITA com equipes em LISTA_ESPERA, na ordem em que completaram o mínimo.
 * Sem `limiteEquipes`, todas as equipes da fila são inscritas.
 */
export async function promoverListaEspera(tx: Tx, hackathonId: string) {
  const { limiteEquipes } = await tx.hackathon.findUniqueOrThrow({ where: { id: hackathonId }, select: { limiteEquipes: true } });
  const fila = await tx.team.findMany({
    where: { hackathonId, situacao: "LISTA_ESPERA" },
    orderBy: [{ completaEm: "asc" }, { criadoEm: "asc" }],
    select: { id: true },
  });
  if (fila.length === 0) return;

  const vagas = limiteEquipes == null
    ? fila.length
    : limiteEquipes - (await tx.team.count({ where: { hackathonId, situacao: "INSCRITA" } }));
  for (const { id } of fila.slice(0, Math.max(0, vagas))) {
    await tx.team.update({ where: { id }, data: { situacao: "INSCRITA" } });
  }
}

/**
 * Recalcula a situação pelo mínimo de integrantes e pelo limite de equipes da edição:
 * abaixo do mínimo → EM_FORMACAO (libera a vaga); completa → INSCRITA ou LISTA_ESPERA.
 * DESCLASSIFICADA só muda pelo admin.
 */
async function atualizarSituacao(tx: Tx, teamId: string) {
  const team = await tx.team.findUniqueOrThrow({
    where: { id: teamId },
    include: { hackathon: { select: { limiteMinIntegrantes: true, limiteEquipes: true } } },
  });
  if (team.situacao === "DESCLASSIFICADA") return;

  const ativos = await tx.teamMember.count({ where: { teamId, saiuEm: null } });
  const completa = ativos >= team.hackathon.limiteMinIntegrantes;

  if (!completa) {
    if (team.situacao !== "EM_FORMACAO" || team.completaEm) {
      await tx.team.update({ where: { id: teamId }, data: { situacao: "EM_FORMACAO", completaEm: null } });
    }
    if (team.situacao === "INSCRITA") await promoverListaEspera(tx, team.hackathonId);
    return;
  }

  if (team.situacao === "INSCRITA") return; // já ocupa uma vaga
  const semLimite = team.hackathon.limiteEquipes == null;
  await tx.team.update({
    where: { id: teamId },
    data: { situacao: semLimite ? "INSCRITA" : "LISTA_ESPERA", completaEm: team.completaEm ?? new Date() },
  });
  if (!semLimite) await promoverListaEspera(tx, team.hackathonId);
}

/** Promove o membro ativo mais antigo quando o líder sai/é removido. */
async function promoverProximoLider(tx: Tx, teamId: string) {
  const proximo = await tx.teamMember.findFirst({
    where: { teamId, saiuEm: null },
    orderBy: { entrouEm: "asc" },
  });
  await tx.team.update({ where: { id: teamId }, data: { liderId: proximo?.userId ?? null } });
}

function exigirParticipante(user: CurrentUser) {
  if (user.papel !== "PARTICIPANTE") throw forbidden("Apenas participantes podem integrar equipes");
}

function exigirAlteracoesAbertas(hackathon: { status: string; inscricaoInicio: Date | null; inscricaoFim: Date | null }) {
  if (!inscricoesAbertas(hackathon)) {
    throw badRequest("A composição das equipes está bloqueada porque as inscrições encerraram");
  }
}

export async function criarEquipe(user: CurrentUser, nome: string, hackathonId?: string) {
  exigirParticipante(user);
  const hackathon = await resolveHackathon(hackathonId);
  if (!inscricoesAbertas(hackathon)) throw badRequest("Inscrições encerradas para esta edição");

  const team = await prisma.$transaction(async (tx) => {
    if (await membroAtivo(tx, user.id, hackathon.id)) throw conflict("Você já participa de uma equipe nesta edição");

    const created = await tx.team.create({
      data: {
        nome,
        hackathonId: hackathon.id,
        liderId: user.id,
        codigoConvite: gerarCodigoConvite(),
        membros: { create: { userId: user.id } },
      },
    });
    await atualizarSituacao(tx, created.id);
    return created;
  });

  return buscarEquipe(team.id);
}

export async function regenerarConvite(user: CurrentUser, teamId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { hackathon: true } });
  if (!team) throw notFound("Equipe não encontrada");
  if (team.liderId !== user.id) throw forbidden("Apenas o líder pode gerar convites");
  exigirAlteracoesAbertas(team.hackathon);

  return prisma.team.update({
    where: { id: teamId },
    data: { codigoConvite: gerarCodigoConvite() },
    select: { id: true, codigoConvite: true },
  });
}

export async function entrarComCodigo(user: CurrentUser, codigo: string) {
  exigirParticipante(user);
  const team = await prisma.team.findUnique({
    where: { codigoConvite: codigo.trim().toUpperCase() },
    include: { hackathon: true },
  });
  if (!team) throw notFound("Código de convite inválido");
  if (team.situacao === "DESCLASSIFICADA") throw badRequest("Equipe desclassificada");
  if (!inscricoesAbertas(team.hackathon)) throw badRequest("Inscrições encerradas para esta edição");

  await prisma.$transaction(async (tx) => {
    if (await membroAtivo(tx, user.id, team.hackathonId)) throw conflict("Você já participa de uma equipe nesta edição");

    const ativos = await tx.teamMember.count({ where: { teamId: team.id, saiuEm: null } });
    if (ativos >= team.hackathon.limiteMaxIntegrantes) {
      throw conflict(`Equipe completa (máximo de ${team.hackathon.limiteMaxIntegrantes} integrantes)`);
    }

    await tx.teamMember.create({ data: { teamId: team.id, userId: user.id } });
    if (!team.liderId) await tx.team.update({ where: { id: team.id }, data: { liderId: user.id } });
    await atualizarSituacao(tx, team.id);
  });

  return buscarEquipe(team.id);
}

async function desligarMembro(tx: Tx, teamId: string, userId: string) {
  const membro = await tx.teamMember.findFirst({ where: { teamId, userId, saiuEm: null } });
  if (!membro) throw notFound("Membro não encontrado na equipe");

  await tx.teamMember.update({ where: { id: membro.id }, data: { saiuEm: new Date() } });

  const team = await tx.team.findUniqueOrThrow({ where: { id: teamId } });
  if (team.liderId === userId) await promoverProximoLider(tx, teamId);
  await atualizarSituacao(tx, teamId);
}

/** Desliga o usuário de todas as equipes ativas (usado na anonimização da conta). */
export async function desligarDeTodasAsEquipes(tx: Tx, userId: string) {
  const ativas = await tx.teamMember.findMany({ where: { userId, saiuEm: null }, select: { teamId: true } });
  for (const { teamId } of ativas) await desligarMembro(tx, teamId, userId);
}

export async function sairDaEquipe(user: CurrentUser, teamId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { hackathon: true } });
  if (!team) throw notFound("Equipe não encontrada");
  exigirAlteracoesAbertas(team.hackathon);
  await prisma.$transaction((tx) => desligarMembro(tx, teamId, user.id));
}

export async function removerMembro(user: CurrentUser, teamId: string, alvoUserId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { hackathon: true } });
  if (!team) throw notFound("Equipe não encontrada");

  const isAdmin = user.papel === "ADMIN";
  if (!isAdmin && team.liderId !== user.id) throw forbidden("Apenas o líder ou um admin pode remover membros");
  if (!isAdmin) exigirAlteracoesAbertas(team.hackathon);
  if (!isAdmin && alvoUserId === user.id) {
    throw badRequest("Para sair da equipe use /api/equipe/sair");
  }

  await prisma.$transaction((tx) => desligarMembro(tx, teamId, alvoUserId));
  return buscarEquipe(teamId);
}

export async function transferirLideranca(user: CurrentUser, teamId: string, novoLiderId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId }, include: { hackathon: true } });
  if (!team) throw notFound("Equipe não encontrada");
  if (team.liderId !== user.id && user.papel !== "ADMIN") throw forbidden("Apenas o líder atual pode transferir");
  if (user.papel !== "ADMIN") exigirAlteracoesAbertas(team.hackathon);

  const membro = await prisma.teamMember.findFirst({ where: { teamId, userId: novoLiderId, saiuEm: null } });
  if (!membro) throw badRequest("O novo líder precisa ser membro ativo da equipe");

  await prisma.team.update({ where: { id: teamId }, data: { liderId: novoLiderId } });
  return buscarEquipe(teamId);
}

/** Correção manual pelo admin (situação, nome, líder). */
export async function atualizarEquipeAdmin(
  teamId: string,
  data: { nome?: string; situacao?: "EM_FORMACAO" | "INSCRITA" | "DESCLASSIFICADA"; liderId?: string | null },
) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw notFound("Equipe não encontrada");

  if (data.liderId) {
    const membro = await prisma.teamMember.findFirst({ where: { teamId, userId: data.liderId, saiuEm: null } });
    if (!membro) throw badRequest("O líder precisa ser membro ativo da equipe");
  } else if (data.liderId === null) {
    const ativos = await prisma.teamMember.count({ where: { teamId, saiuEm: null } });
    if (ativos > 0) throw badRequest("A equipe não pode ficar sem líder enquanto houver integrantes");
  }

  await prisma.$transaction(async (tx) => {
    await tx.team.update({ where: { id: teamId }, data });
    if (data.situacao === "DESCLASSIFICADA") {
      // Vaga liberada: a primeira equipe da lista de espera assume.
      if (team.situacao === "INSCRITA") await promoverListaEspera(tx, team.hackathonId);
    } else {
      // Fora DESCLASSIFICADA, a situação segue o número de membros e o limite de equipes.
      await atualizarSituacao(tx, teamId);
    }
  });
  return buscarEquipe(teamId);
}
