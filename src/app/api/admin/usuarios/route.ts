import { contem, prisma } from "@/src/lib/db";
import { parseQuery, route } from "@/src/lib/http";
import { publicUserSelect, requireRole } from "@/src/lib/auth";
import { adminUsuariosQuerySchema } from "@/src/server/identidade/schemas";

export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { q, vinculo, papel, situacao, page, pageSize } = parseQuery(request, adminUsuariosQuerySchema);

  const where = {
    vinculo,
    papel,
    situacao,
    ...(q && { OR: [{ nome: contem(q) }, { email: contem(q) }] }),
  };

  const [total, usuarios] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: { criadoEm: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return Response.json({ usuarios, total, page, pageSize });
});
