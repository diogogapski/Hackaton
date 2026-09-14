import { prisma } from "@/src/lib/db";
import { conflict, notFound, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";

type Ctx = { params: Promise<{ id: string; projetoId: string }> };

/** Remove uma atribuição ainda não concluída. */
export const DELETE = route<Ctx>(async (_request, { params }) => {
  await requireRole("ADMIN");
  const { id: juradoId, projetoId } = await params;

  const atribuicao = await prisma.avaliacaoAtribuicao.findUnique({
    where: { juradoId_projetoId: { juradoId, projetoId } },
  });
  if (!atribuicao) throw notFound("Atribuição não encontrada");
  if (atribuicao.concluida) throw conflict("Atribuição já concluída não pode ser removida");

  await prisma.avaliacaoAtribuicao.delete({ where: { id: atribuicao.id } });
  return Response.json({ ok: true });
});
