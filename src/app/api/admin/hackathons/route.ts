import { prisma } from "@/src/lib/db";
import { badRequest, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { hackathonCreateSchema, validarHackathon } from "@/src/server/hackathon/schemas";

export const GET = route(async () => {
  await requireRole("ADMIN");
  const hackathons = await prisma.hackathon.findMany({
    orderBy: { dataInicio: "desc" },
    include: { _count: { select: { equipes: true, projetos: true, desafios: true } } },
  });
  return Response.json({ hackathons });
});

export const POST = route(async (request) => {
  await requireRole("ADMIN");
  const data = await parseBody(request, hackathonCreateSchema);
  const erros = validarHackathon({ limiteMinIntegrantes: 3, limiteMaxIntegrantes: 5, notaMin: 0, notaMax: 10, ...data });
  if (erros.length) throw badRequest("Dados inválidos", erros);

  const hackathon = await prisma.hackathon.create({ data });
  return Response.json({ hackathon }, { status: 201 });
});
