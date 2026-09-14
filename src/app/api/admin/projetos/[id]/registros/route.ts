import { prisma } from "@/src/lib/db";
import { notFound, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

/** Trilha de auditoria das notas de um projeto: quem lançou/alterou, quando e de quanto para quanto. */
export const GET = route<Ctx>(async (_request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;

  const projeto = await prisma.projeto.findUnique({ where: { id }, select: { id: true, nome: true } });
  if (!projeto) throw notFound("Projeto não encontrado");

  const registros = await prisma.registroAvaliacao.findMany({
    where: { projetoId: id },
    orderBy: { registradoEm: "asc" },
    select: {
      id: true,
      notaAnterior: true,
      notaNova: true,
      comentario: true,
      registradoEm: true,
      justificativa: true,
      jurado: { select: { id: true, nome: true } },
      criterio: { select: { id: true, nome: true } },
      alteradoPor: { select: { id: true, nome: true } },
    },
  });

  return Response.json({
    projeto,
    registros: registros.map((r) => ({
      ...r,
      tipo: r.alteradoPor ? "CORRECAO_COMISSAO" : r.notaAnterior == null ? "LANCAMENTO" : "ALTERACAO_JURADO",
      // A tela de histórico mostra `comentario`: na correção, exibe quem corrigiu e por quê.
      comentario: r.alteradoPor ? `Correção pela comissão (${r.alteradoPor.nome}): ${r.justificativa}` : r.comentario,
    })),
  });
});
