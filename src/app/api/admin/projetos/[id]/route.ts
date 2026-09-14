import { prisma } from "@/src/lib/db";
import { conflict, notFound, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { adminProjetoSituacaoSchema } from "@/src/server/hackathon/schemas";

type Ctx = { params: Promise<{ id: string }> };

/** Desclassifica ou reativa um projeto. Reativar volta a ENVIADO se já tinha sido enviado. */
export const PUT = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const { situacao } = await parseBody(request, adminProjetoSituacaoSchema);

  const projeto = await prisma.projeto.findUnique({ where: { id }, include: { hackathon: true } });
  if (!projeto) throw notFound("Projeto não encontrado");
  if (projeto.hackathon.resultadosPublicados) throw conflict("Despublique os resultados antes de alterar projetos");

  const nova = situacao === "DESCLASSIFICADO" ? situacao : projeto.enviadoEm ? "ENVIADO" : "RASCUNHO";
  const atualizado = await prisma.projeto.update({ where: { id }, data: { situacao: nova } });
  return Response.json({ projeto: atualizado });
});
