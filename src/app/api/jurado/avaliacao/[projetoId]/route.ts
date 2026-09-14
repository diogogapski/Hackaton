import { prisma } from "@/src/lib/db";
import { badRequest, conflict, notFound, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { avaliacaoSchema } from "@/src/server/hackathon/schemas";

type Ctx = { params: Promise<{ projetoId: string }> };

async function carregarAtribuicao(juradoId: string, projetoId: string) {
  const atribuicao = await prisma.avaliacaoAtribuicao.findUnique({
    where: { juradoId_projetoId: { juradoId, projetoId } },
    include: { projeto: { include: { hackathon: true } } },
  });
  if (!atribuicao || atribuicao.projeto.situacao !== "ENVIADO") {
    throw notFound("Projeto não atribuído a você");
  }
  return atribuicao;
}

export const GET = route<Ctx>(async (_request, { params }) => {
  const jurado = await requireRole("JURADO");
  const { projetoId } = await params;
  const atribuicao = await carregarAtribuicao(jurado.id, projetoId);
  const { hackathon, ...projeto } = atribuicao.projeto;

  const [equipe, desafio, criterios, notas] = await Promise.all([
    prisma.team.findUnique({
      where: { id: projeto.teamId },
      select: {
        id: true,
        nome: true,
        membros: { where: { saiuEm: null }, select: { user: { select: { id: true, nome: true } } } },
      },
    }),
    projeto.desafioId ? prisma.desafio.findUnique({ where: { id: projeto.desafioId } }) : null,
    prisma.criterio.findMany({ where: { hackathonId: hackathon.id }, orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] }),
    prisma.avaliacao.findMany({ where: { projetoId, juradoId: jurado.id } }),
  ]);

  return Response.json({
    projeto,
    equipe: equipe && { id: equipe.id, nome: equipe.nome, integrantes: equipe.membros.map((m) => m.user) },
    desafio,
    criterios,
    escala: { notaMin: hackathon.notaMin, notaMax: hackathon.notaMax },
    notas,
    concluida: atribuicao.concluida,
    podeEditar: !hackathon.resultadosPublicados && (!atribuicao.concluida || hackathon.permitirEdicaoAvaliacao),
  });
});

export const POST = route<Ctx>(async (request, { params }) => {
  const jurado = await requireRole("JURADO");
  const { projetoId } = await params;
  const body = await parseBody(request, avaliacaoSchema);
  const atribuicao = await carregarAtribuicao(jurado.id, projetoId);
  const { hackathon } = atribuicao.projeto;

  if (hackathon.resultadosPublicados) throw conflict("Resultados já publicados; avaliações encerradas");
  if (atribuicao.concluida && !hackathon.permitirEdicaoAvaliacao) throw conflict("Avaliação já enviada");

  const criterios = await prisma.criterio.findMany({ where: { hackathonId: hackathon.id } });
  if (criterios.length === 0) throw badRequest("Nenhum critério configurado para esta edição");

  const enviados = new Map(body.notas.map((n) => [n.criterioId, n]));
  if (enviados.size !== body.notas.length) throw badRequest("Critério repetido nas notas");

  const erros: string[] = [];
  for (const c of criterios) {
    const n = enviados.get(c.id);
    if (!n) erros.push(`Nota ausente para "${c.nome}"`);
    else if (n.nota < hackathon.notaMin || n.nota > hackathon.notaMax) {
      erros.push(`Nota de "${c.nome}" deve estar entre ${hackathon.notaMin} e ${hackathon.notaMax}`);
    }
  }
  const idsValidos = new Set(criterios.map((c) => c.id));
  for (const id of enviados.keys()) if (!idsValidos.has(id)) erros.push(`Critério inválido: ${id}`);
  if (erros.length) throw badRequest("Avaliação inválida", erros);

  const agora = new Date();
  const anteriores = new Map(
    (await prisma.avaliacao.findMany({ where: { projetoId, juradoId: jurado.id } })).map((a) => [a.criterioId, a]),
  );

  await prisma.$transaction([
    ...criterios.flatMap((c) => {
      const n = enviados.get(c.id)!;
      const comentario = n.comentario ?? body.comentario ?? null;
      const dados = { nota: n.nota, comentario, avaliadoEm: agora };
      const anterior = anteriores.get(c.id);
      const mudou = !anterior || anterior.nota !== n.nota || anterior.comentario !== comentario;
      return [
        prisma.avaliacao.upsert({
          where: { projetoId_juradoId_criterioId: { projetoId, juradoId: jurado.id, criterioId: c.id } },
          create: { projetoId, juradoId: jurado.id, criterioId: c.id, ...dados },
          update: dados,
        }),
        // Trilha de auditoria: registra lançamento inicial e cada alteração de nota/comentário.
        ...(mudou
          ? [prisma.registroAvaliacao.create({
              data: { projetoId, juradoId: jurado.id, criterioId: c.id, notaAnterior: anterior?.nota ?? null, notaNova: n.nota, comentario, registradoEm: agora },
            })]
          : []),
      ];
    }),
    prisma.avaliacaoAtribuicao.update({
      where: { id: atribuicao.id },
      data: { concluida: true, concluidaEm: agora },
    }),
  ]);

  return Response.json({ ok: true });
});
