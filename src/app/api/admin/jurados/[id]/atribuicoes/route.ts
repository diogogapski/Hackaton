import { prisma } from "@/src/lib/db";
import { parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { atribuirProjetos, exigirJurado } from "@/src/server/avaliacao/atribuicoes";
import { atribuicoesSchema } from "@/src/server/hackathon/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await exigirJurado(id);

  const atribuicoes = await prisma.avaliacaoAtribuicao.findMany({
    where: { juradoId: id },
    include: { projeto: { select: { id: true, nome: true, team: { select: { nome: true } } } } },
    orderBy: { criadoEm: "asc" },
  });
  return Response.json({ atribuicoes });
});

export const POST = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const { projetoIds } = await parseBody(request, atribuicoesSchema);
  const resultado = await atribuirProjetos(id, projetoIds);
  return Response.json(resultado, { status: 201 });
});
