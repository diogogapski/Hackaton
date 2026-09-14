import { prisma } from "@/src/lib/db";
import { parseBody, route } from "@/src/lib/http";
import { publicUserSelect, requireRole } from "@/src/lib/auth";
import { alterarPapel } from "@/src/server/identidade/usuarios";
import { autorizarJuradoSchema } from "@/src/server/hackathon/schemas";

export const GET = route(async () => {
  await requireRole("ADMIN");
  const jurados = await prisma.user.findMany({
    where: { papel: "JURADO" },
    select: {
      ...publicUserSelect,
      atribuicoes: { select: { projetoId: true, concluida: true } },
    },
    orderBy: { nome: "asc" },
  });

  return Response.json({
    jurados: jurados.map(({ atribuicoes, ...j }) => ({
      ...j,
      atribuicoes: atribuicoes.length,
      concluidas: atribuicoes.filter((a) => a.concluida).length,
    })),
  });
});

/** Autoriza um usuário existente como jurado (papel gerenciado pelo Bloco A). */
export const POST = route(async (request) => {
  const admin = await requireRole("ADMIN");
  const { userId } = await parseBody(request, autorizarJuradoSchema);
  const jurado = await alterarPapel(userId, "JURADO", admin.id);
  return Response.json({ jurado }, { status: 201 });
});
