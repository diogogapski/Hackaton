import { z } from "zod";
import { prisma } from "@/src/lib/db";
import { badRequest, conflict, notFound, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";

const corrigirSchema = z.object({
  projetoId: z.string(),
  juradoId: z.string(),
  criterioId: z.string(),
  nota: z.number(),
  justificativa: z.string().trim().min(10, "Explique o motivo da correção (mínimo 10 caracteres)").max(2000),
});

/**
 * Correção de nota pela comissão (canvas: "quem pode alterar nota já lançada por um jurado — e isso
 * fica registrado?"). Só ADMIN, só antes da publicação, com justificativa obrigatória; o registro guarda
 * quem corrigiu, o valor anterior e o novo.
 */
export const POST = route(async (request) => {
  const admin = await requireRole("ADMIN");
  const { projetoId, juradoId, criterioId, nota, justificativa } = await parseBody(request, corrigirSchema);

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { projetoId_juradoId_criterioId: { projetoId, juradoId, criterioId } },
    include: { projeto: { include: { hackathon: true } } },
  });
  if (!avaliacao) throw notFound("Nota não encontrada para este jurado, projeto e critério");

  const { hackathon } = avaliacao.projeto;
  if (hackathon.resultadosPublicados) throw conflict("Despublique os resultados antes de corrigir notas");
  if (nota < hackathon.notaMin || nota > hackathon.notaMax) {
    throw badRequest(`A nota deve estar entre ${hackathon.notaMin} e ${hackathon.notaMax}`);
  }
  if (nota === avaliacao.nota) throw badRequest("A nota informada é igual à atual");

  const [atualizada, registro] = await prisma.$transaction([
    prisma.avaliacao.update({ where: { id: avaliacao.id }, data: { nota } }),
    prisma.registroAvaliacao.create({
      data: {
        projetoId,
        juradoId,
        criterioId,
        notaAnterior: avaliacao.nota,
        notaNova: nota,
        comentario: avaliacao.comentario,
        alteradoPorId: admin.id,
        justificativa,
      },
    }),
  ]);
  return Response.json({ avaliacao: atualizada, registro });
});
