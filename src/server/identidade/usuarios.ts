import { prisma } from "@/src/lib/db";
import { badRequest, notFound } from "@/src/lib/http";
import { publicUserSelect } from "@/src/lib/auth";
import type { Papel } from "@/src/generated/prisma/enums";

/**
 * Única forma de alterar o papel de um usuário. O Bloco B (ex.: autorizar jurado)
 * deve chamar esta função em vez de atualizar User diretamente.
 */
export async function alterarPapel(userId: string, papel: Papel, porUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, papel: true } });
  if (!user) throw notFound("Usuário não encontrado");

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
