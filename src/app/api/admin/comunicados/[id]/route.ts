import { prisma } from "@/src/lib/db";
import { notFound, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { comunicadoUpdateSchema } from "@/src/server/hackathon/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const { publicar, ...data } = await parseBody(request, comunicadoUpdateSchema);

  const atual = await prisma.comunicado.findUnique({ where: { id } });
  if (!atual) throw notFound("Comunicado não encontrado");

  const publicadoEm = publicar === undefined ? undefined : publicar ? (atual.publicadoEm ?? new Date()) : null;
  const comunicado = await prisma.comunicado.update({ where: { id }, data: { ...data, publicadoEm } });
  return Response.json({ comunicado });
});

export const DELETE = route<Ctx>(async (_request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.comunicado.delete({ where: { id } });
  return Response.json({ ok: true });
});
