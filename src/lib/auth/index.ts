/**
 * Helpers de autenticação compartilhados (dono: Dev Back 1).
 *
 * O Bloco B deve usar SOMENTE estas funções para saber quem está logado
 * e a que equipe pertence — nunca consultar sessão/usuário por conta própria.
 *
 *   const user = await requireAuth();                 // 401 se não logado
 *   const admin = await requireRole("ADMIN");         // 403 se sem papel
 *   const jurado = await requireRole(["JURADO", "ADMIN"]);
 *   const user = await getCurrentUser();              // null se não logado
 *   const team = await getCurrentUserTeam(hackathonId); // null se sem equipe
 */
import { prisma } from "@/src/lib/db";
import { forbidden, unauthorized } from "@/src/lib/http";
import { readSession } from "@/src/lib/auth/session";
import type { Papel } from "@/src/generated/prisma/enums";

/** Campos do usuário seguros para retornar na API (sem senhaHash). */
export const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
  emailVerificadoEm: true,
  vinculo: true,
  matricula: true,
  siape: true,
  curso: true,
  telefone: true,
  papel: true,
  situacao: true,
  termosAceitosEm: true,
  anonimizadoEm: true,
  criadoEm: true,
} as const;

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function getCurrentUser() {
  const sessao = await readSession();
  if (!sessao) return null;

  const registro = await prisma.user.findUnique({
    where: { id: sessao.userId },
    select: { ...publicUserSelect, sessoesValidasApos: true },
  });
  if (!registro || registro.situacao !== "ATIVO") return null;

  // Sessão emitida antes de uma troca de senha/anonimização deixa de valer.
  const { sessoesValidasApos, ...user } = registro;
  if (sessoesValidasApos && sessao.emitidaEm * 1000 < sessoesValidasApos.getTime()) return null;
  return user;
}

export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function requireRole(papeis: Papel | Papel[]): Promise<CurrentUser> {
  const user = await requireAuth();
  const permitidos = Array.isArray(papeis) ? papeis : [papeis];
  if (!permitidos.includes(user.papel)) throw forbidden();
  return user;
}

export const teamWithMembersInclude = {
  lider: { select: { id: true, nome: true, email: true } },
  membros: {
    where: { saiuEm: null },
    orderBy: { entrouEm: "asc" },
    select: {
      id: true,
      userId: true,
      entrouEm: true,
      user: { select: { id: true, nome: true, email: true, vinculo: true, curso: true } },
    },
  },
} as const;

/**
 * Equipe ativa do usuário logado. Com `hackathonId`, restringe àquela edição;
 * sem ele, retorna a participação ativa mais recente.
 */
export async function getCurrentUserTeam(hackathonId?: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id, saiuEm: null, ...(hackathonId && { team: { hackathonId } }) },
    orderBy: { entrouEm: "desc" },
    select: { teamId: true },
  });
  if (!membership) return null;

  return prisma.team.findUnique({
    where: { id: membership.teamId },
    include: teamWithMembersInclude,
  });
}
