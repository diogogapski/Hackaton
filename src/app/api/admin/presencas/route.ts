import { z } from "zod";
import { prisma } from "@/src/lib/db";
import { badRequest, parseBody, parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";
import { participantesDaEdicao } from "@/src/server/operacao/relatorio";

const marcarSchema = z.object({
  hackathonId: z.string().optional(),
  userId: z.string(),
  presente: z.boolean(),
});

/** Lista de presença da edição: participantes em equipes, com a presença marcada. */
export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });
  const participantes = await participantesDaEdicao(hackathon.id);
  return Response.json({
    hackathon: { id: hackathon.id, nome: hackathon.nome },
    total: participantes.length,
    presentes: participantes.filter((p) => p.presente).length,
    participantes,
  });
});

/** Marca ou desmarca a presença de um participante (check-in no evento). */
export const POST = route(async (request) => {
  const admin = await requireRole("ADMIN");
  const { hackathonId, userId, presente } = await parseBody(request, marcarSchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  const participa = await prisma.teamMember.count({ where: { userId, saiuEm: null, team: { hackathonId: hackathon.id } } });
  if (!participa) throw badRequest("Só participantes de equipes desta edição têm presença registrada");

  if (presente) {
    await prisma.presenca.upsert({
      where: { hackathonId_userId: { hackathonId: hackathon.id, userId } },
      create: { hackathonId: hackathon.id, userId, registradoPorId: admin.id },
      update: {},
    });
  } else {
    await prisma.presenca.deleteMany({ where: { hackathonId: hackathon.id, userId } });
  }
  return Response.json({ userId, presente });
});
