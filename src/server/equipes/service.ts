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

/** Recalcula EM_FORMACAO/INSCRITA pelo mínimo configurado. DESCLASSIFICADA não muda. */
async function atualizarSituacao(tx: Tx, teamId: string) {
  const team = await tx.team.findUniqueOrThrow({
    where: { id: teamId },
    include: { hackathon: { select: { limiteMinIntegrantes: true } } },
  });
  if (team.situacao === "DESCLASSIFICADA") return;

  const ativos = await tx.teamMember.count({ where: { teamId, saiuEm: null } });
  const situacao = ativos >= team.hackathon.limiteMinIntegrantes ? "INSCRITA" : "EM_FORMACAO";
  if (situacao !== team.situacao) await tx.team.update({ where: { id: teamId }, data: { situacao } });
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
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw notFound("Equipe não encontrada");
  if (team.liderId !== user.id) throw forbidden("Apenas o líder pode gerar convites");

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
  await prisma.$transaction((tx) => desligarMembro(tx, teamId, user.id));
}

export async function removerMembro(user: CurrentUser, teamId: string, alvoUserId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw notFound("Equipe não encontrada");

  const isAdmin = user.papel === "ADMIN";
  if (!isAdmin && team.liderId !== user.id) throw forbidden("Apenas o líder ou um admin pode remover membros");
  if (!isAdmin && alvoUserId === user.id) {
    throw badRequest("Para sair da equipe use /api/equipe/sair");
  }

  await prisma.$transaction((tx) => desligarMembro(tx, teamId, alvoUserId));
  return buscarEquipe(teamId);
}

export async function transferirLideranca(user: CurrentUser, teamId: string, novoLiderId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw notFound("Equipe não encontrada");
  if (team.liderId !== user.id && user.papel !== "ADMIN") throw forbidden("Apenas o líder atual pode transferir");

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
    // Fora DESCLASSIFICADA, a situação sempre segue o número de membros (EM_FORMACAO/INSCRITA).
    if (data.situacao !== "DESCLASSIFICADA") await atualizarSituacao(tx, teamId);
  });
  return buscarEquipe(teamId);
}
