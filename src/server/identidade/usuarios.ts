import { randomBytes } from "node:crypto";
import { prisma } from "@/src/lib/db";
import { badRequest, notFound } from "@/src/lib/http";
import { publicUserSelect } from "@/src/lib/auth";
import { hashPassword } from "@/src/lib/auth/password";
import { inicioNovasSessoes } from "@/src/lib/auth/session";
import { desligarDeTodasAsEquipes } from "@/src/server/equipes/service";
import type { Papel } from "@/src/generated/prisma/enums";

/**
 * Exclusão de conta a pedido do titular (LGPD), por anonimização: os dados pessoais são apagados,
 * mas o registro fica para não quebrar histórico de equipes, projetos e avaliações.
 */
export async function anonimizarConta(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { papel: true, anonimizadoEm: true } });
  if (!user) throw notFound("Usuário não encontrado");
  if (user.anonimizadoEm) throw badRequest("Conta já anonimizada");

  if (user.papel === "ADMIN") {
    const outros = await prisma.user.count({ where: { papel: "ADMIN", situacao: "ATIVO", id: { not: userId } } });
    if (outros === 0) throw badRequest("Não é possível excluir o último administrador");
  }

  // Senha aleatória descartada: ninguém mais consegue entrar nesta conta.
  const senhaHash = await hashPassword(randomBytes(32).toString("base64url"));

  await prisma.$transaction(async (tx) => {
    await desligarDeTodasAsEquipes(tx, userId);
    await tx.passwordReset.deleteMany({ where: { userId } });
    await tx.user.update({
      where: { id: userId },
      data: {
        nome: "Conta removida",
        email: `removido-${userId}@anonimizado.invalid`,
        matricula: null,
        siape: null,
        cpf: null,
        curso: null,
        telefone: null,
        senhaHash,
        situacao: "BLOQUEADO",
        anonimizadoEm: new Date(),
        sessoesValidasApos: inicioNovasSessoes(),
      },
    });
  });
}

/**
 * Única forma de alterar o papel de um usuário. O Bloco B (ex.: autorizar jurado)
 * deve chamar esta função em vez de atualizar User diretamente.
 */
export async function alterarPapel(userId: string, papel: Papel, porUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, papel: true, anonimizadoEm: true } });
  if (!user) throw notFound("Usuário não encontrado");
  if (user.anonimizadoEm) throw badRequest("Conta anonimizada não pode receber papel");

  if (user.id === porUserId && user.papel === "ADMIN" && papel !== "ADMIN") {
    const admins = await prisma.user.count({ where: { papel: "ADMIN", situacao: "ATIVO" } });
    if (admins <= 1) throw badRequest("Não é possível remover o último administrador");
  }

  if (papel !== "PARTICIPANTE") {
    const emEquipe = await prisma.teamMember.count({ where: { userId, saiuEm: null } });
    if (emEquipe > 0) throw badRequest("Usuário participa de uma equipe ativa; remova-o antes de alterar o papel");
  }

  return prisma.user.update({ where: { id: userId }, data: { papel }, select: publicUserSelect });
}
