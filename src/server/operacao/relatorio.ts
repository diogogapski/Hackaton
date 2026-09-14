import { prisma } from "@/src/lib/db";
import { gerarResultados } from "@/src/server/avaliacao/resultados";
export { paraCsv } from "@/src/server/operacao/csv";

/** Participantes ativos em equipes da edição, com equipe e presença (base do relatório e da presença). */
export async function participantesDaEdicao(hackathonId: string) {
  const [membros, presencas] = await Promise.all([
    prisma.teamMember.findMany({
      where: { saiuEm: null, team: { hackathonId } },
      orderBy: [{ team: { nome: "asc" } }, { user: { nome: "asc" } }],
      select: {
        user: { select: { id: true, nome: true, email: true, vinculo: true, curso: true } },
        team: { select: { id: true, nome: true, situacao: true, liderId: true } },
      },
    }),
    prisma.presenca.findMany({ where: { hackathonId }, select: { userId: true, registradoEm: true } }),
  ]);
  const presente = new Map(presencas.map((p) => [p.userId, p.registradoEm]));
  return membros.map((m) => ({
    ...m.user,
    equipe: { id: m.team.id, nome: m.team.nome, situacao: m.team.situacao },
    lider: m.team.liderId === m.user.id,
    presente: presente.has(m.user.id),
    presencaEm: presente.get(m.user.id) ?? null,
  }));
}

const contarPor = <T>(itens: T[], chave: (i: T) => string) =>
  itens.reduce<Record<string, number>>((acc, i) => ({ ...acc, [chave(i)]: (acc[chave(i)] ?? 0) + 1 }), {});

/**
 * Números consolidados para a coordenação (canvas: "inscritos, presentes, resultado para divulgação
 * institucional e prestação de contas").
 */
export async function relatorioConsolidado(hackathonId: string) {
  const hackathon = await prisma.hackathon.findUniqueOrThrow({ where: { id: hackathonId } });
  const [participantes, equipes, projetos, atribuicoes, jurados, cadastros, comunicados, mudancasAgenda] = await Promise.all([
    participantesDaEdicao(hackathonId),
    prisma.team.findMany({ where: { hackathonId }, select: { situacao: true } }),
    prisma.projeto.findMany({ where: { hackathonId }, select: { situacao: true } }),
    prisma.avaliacaoAtribuicao.findMany({ where: { projeto: { hackathonId } }, select: { concluida: true, juradoId: true } }),
    prisma.user.count({ where: { papel: "JURADO", situacao: "ATIVO" } }),
    prisma.user.count({ where: { papel: "PARTICIPANTE", anonimizadoEm: null } }),
    prisma.comunicado.count({ where: { hackathonId, publicadoEm: { not: null } } }),
    prisma.comunicado.count({ where: { hackathonId, origem: "AGENDA" } }),
  ]);

  const inscritos = participantes.filter((p) => p.equipe.situacao === "INSCRITA");
  const presentes = inscritos.filter((p) => p.presente);
  const resultados = hackathon.resultadosPublicados ? await gerarResultados(hackathonId) : null;

  return {
    edicao: {
      id: hackathon.id,
      nome: hackathon.nome,
      status: hackathon.status,
      local: hackathon.local,
      dataInicio: hackathon.dataInicio,
      dataFim: hackathon.dataFim,
      resultadosPublicados: hackathon.resultadosPublicados,
    },
    participantes: {
      contasDeParticipante: cadastros,
      emEquipes: participantes.length,
      inscritos: inscritos.length,
      presentes: presentes.length,
      taxaPresenca: inscritos.length ? Math.round((presentes.length / inscritos.length) * 1000) / 10 : null,
      porVinculo: contarPor(inscritos, (p) => p.vinculo),
      porCurso: contarPor(inscritos.filter((p) => p.curso), (p) => p.curso!),
    },
    equipes: { total: equipes.length, porSituacao: contarPor(equipes, (e) => e.situacao), limite: hackathon.limiteEquipes },
    projetos: { total: projetos.length, porSituacao: contarPor(projetos, (p) => p.situacao) },
    avaliacao: {
      jurados,
      juradosComAtribuicao: new Set(atribuicoes.map((a) => a.juradoId)).size,
      atribuicoes: atribuicoes.length,
      concluidas: atribuicoes.filter((a) => a.concluida).length,
    },
    comunicacao: { comunicadosPublicados: comunicados, mudancasDeAgendaComunicadas: mudancasAgenda },
    podio: resultados
      ? resultados.ranking.filter((l) => l.posicao != null && l.posicao <= 3).map((l) => ({
          posicao: l.posicao,
          projeto: l.projeto.nome,
          equipe: l.equipe.nome,
          notaFinal: l.notaFinal,
        }))
      : null,
  };
}
