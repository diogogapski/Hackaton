import { prisma } from "@/src/lib/db";
import { badRequest, notFound, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { agendaUpdateSchema } from "@/src/server/hackathon/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const data = await parseBody(request, agendaUpdateSchema);

  const atual = await prisma.agendaItem.findUnique({ where: { id } });
  if (!atual) throw notFound("Item de agenda não encontrado");
  const inicio = data.horarioInicio ?? atual.horarioInicio;
  const fim = data.horarioFim === undefined ? atual.horarioFim : data.horarioFim;
  if (fim && fim < inicio) throw badRequest("horarioFim anterior ao início");

  const item = await prisma.agendaItem.update({ where: { id }, data });
  return Response.json({ item });
});

export const DELETE = route<Ctx>(async (_request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.agendaItem.delete({ where: { id } });
  return Response.json({ ok: true });
});
