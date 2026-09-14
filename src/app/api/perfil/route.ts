import { prisma } from "@/src/lib/db";
import { conflict, parseBody, route } from "@/src/lib/http";
import { publicUserSelect, requireAuth } from "@/src/lib/auth";
import { perfilUpdateSchema } from "@/src/server/identidade/schemas";

export const GET = route(async () => {
  const user = await requireAuth();
  return Response.json({ user });
});

export const PUT = route(async (request) => {
  const user = await requireAuth();
  const data = await parseBody(request, perfilUpdateSchema);

  if (data.email && data.email !== user.email) {
    const existe = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (existe) throw conflict("E-mail já está em uso");
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data, select: publicUserSelect });
  return Response.json({ user: updated });
});
