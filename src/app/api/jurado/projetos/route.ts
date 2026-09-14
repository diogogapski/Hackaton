import { prisma } from "@/src/lib/db";
import { route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";

export const GET = route(async () => {
  const jurado = await requireRole("JURADO");

  const atribuicoes = await prisma.avaliacaoAtribuicao.findMany({
    where: { juradoId: jurado.id, projeto: { situacao: "ENVIADO" } },
    orderBy: [{ concluida: "asc" }, { criadoEm: "asc" }],
    include: {
      projeto: {
        select: {
          id: true,
          nome: true,
          descricao: true,
          enviadoEm: true,
          hackathon: { select: { id: true, nome: true } },
          team: { select: { id: true, nome: true } },
          desafio: { select: { id: true, titulo: true } },
        },
      },
    },
  });

  return Response.json({
    projetos: atribuicoes.map((a) => ({
      ...a.projeto,
      status: a.concluida ? "CONCLUIDA" : "PENDENTE",
      concluidaEm: a.concluidaEm,
    })),
  });
});
