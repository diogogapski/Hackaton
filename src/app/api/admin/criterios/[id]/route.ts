import { prisma } from "@/src/lib/db";
import { conflict, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { criterioUpdateSchema } from "@/src/server/hackathon/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const data = await parseBody(request, criterioUpdateSchema);
  const criterio = await prisma.criterio.update({ where: { id }, data });
  return Response.json({ criterio });
});

export const DELETE = route<Ctx>(async (_request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;

  const notas = await prisma.avaliacao.count({ where: { criterioId: id } });
  if (notas > 0) throw conflict("Critério já possui notas registradas e não pode ser removido");

  await prisma.criterio.delete({ where: { id } });
  return Response.json({ ok: true });
});
