import { prisma } from "@/src/lib/db";
import { notFound, route } from "@/src/lib/http";
import { getCurrentUserTeam, requireAuth } from "@/src/lib/auth";
import { removerMembro } from "@/src/server/equipes/service";

type Ctx = { params: Promise<{ userId: string }> };

/** Líder remove membro da própria equipe; admin remove de qualquer equipe ativa. */
export const DELETE = route<Ctx>(async (_request, { params }) => {
  const user = await requireAuth();
  const { userId } = await params;

  let teamId: string | undefined;
  if (user.papel === "ADMIN") {
    const membro = await prisma.teamMember.findFirst({
      where: { userId, saiuEm: null },
      orderBy: { entrouEm: "desc" },
    });
    teamId = membro?.teamId;
  } else {
    teamId = (await getCurrentUserTeam())?.id;
  }
  if (!teamId) throw notFound("Equipe não encontrada");

  const equipe = await removerMembro(user, teamId, userId);
  return Response.json({ equipe });
});
