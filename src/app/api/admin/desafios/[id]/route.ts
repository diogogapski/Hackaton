import { prisma } from "@/src/lib/db";
import { parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { desafioUpdateSchema } from "@/src/server/hackathon/schemas";

type Ctx = { params: Promise<{ id: string }> };

/** Também usado para publicar/despublicar: `{ "publicado": true }`. */
export const PUT = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const data = await parseBody(request, desafioUpdateSchema);
  const desafio = await prisma.desafio.update({ where: { id }, data });
  return Response.json({ desafio });
});

export const DELETE = route<Ctx>(async (_request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.desafio.delete({ where: { id } });
  return Response.json({ ok: true });
});
