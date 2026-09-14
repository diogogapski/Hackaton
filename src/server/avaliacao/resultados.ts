import { prisma } from "@/src/lib/db";
import { calcularRanking } from "@/src/server/avaliacao/ranking";

/** Busca os dados da edição e aplica `calcularRanking` aos projetos enviados. */
export async function gerarResultados(hackathonId: string) {
  const [criterios, projetos, notas] = await Promise.all([
    prisma.criterio.findMany({ where: { hackathonId }, orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] }),
    prisma.projeto.findMany({
      where: { hackathonId, situacao: "ENVIADO" },
      include: {
        team: { select: { id: true, nome: true } },
        desafio: { select: { id: true, titulo: true } },
        _count: { select: { atribuicoes: true } },
      },
    }),
    prisma.avaliacao.findMany({
      where: { projeto: { hackathonId, situacao: "ENVIADO" } },
      select: { projetoId: true, juradoId: true, criterioId: true, nota: true },
    }),
  ]);

  const porId = new Map(projetos.map((p) => [p.id, p]));
  const ranking = calcularRanking(criterios, projetos, notas).map((linha) => {
    const p = porId.get(linha.projetoId)!;
    return {
      ...linha,
      atribuicoes: p._count.atribuicoes,
      projeto: { id: p.id, nome: p.nome, enviadoEm: p.enviadoEm, desafio: p.desafio },
      equipe: p.team,
    };
  });

  return {
    criterios: criterios.map(({ id, nome, peso, prioridadeDesempate }) => ({ id, nome, peso, prioridadeDesempate })),
    ranking,
  };
}
