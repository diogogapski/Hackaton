/**
 * Cálculo de ranking — função pura, sem acesso ao banco.
 *
 * Nota do critério   = média das notas dos jurados naquele critério.
 * Nota final         = soma(nota_criterio * peso) / soma(pesos dos critérios avaliados).
 * Desempate          = critérios com `prioridadeDesempate` (menor primeiro, maior média vence),
 *                      depois ordem de envio (quem enviou antes fica à frente).
 * Empate persistente = mesma posição (ranking "1, 1, 3").
 * Projetos sem nenhuma nota ficam no fim, sem posição.
 */

export type CriterioRanking = {
  id: string;
  nome: string;
  peso: number;
  prioridadeDesempate: number | null;
};

export type ProjetoRanking = { id: string; enviadoEm: Date | null };

export type NotaRanking = { projetoId: string; juradoId: string; criterioId: string; nota: number };

export type LinhaRanking = {
  projetoId: string;
  posicao: number | null;
  notaFinal: number | null;
  mediasPorCriterio: Record<string, number | null>;
  jurados: number;
  completo: boolean; // todos os critérios receberam ao menos uma nota
};

const EPS = 1e-9;
const arred = (n: number) => Math.round(n * 1000) / 1000;

export function calcularNotaFinal(medias: Record<string, number | null>, criterios: CriterioRanking[]) {
  let soma = 0;
  let pesos = 0;
  for (const c of criterios) {
    const media = medias[c.id];
    if (media == null) continue;
    soma += media * c.peso;
    pesos += c.peso;
  }
  return pesos > 0 ? soma / pesos : null;
}

export function calcularRanking(
  criterios: CriterioRanking[],
  projetos: ProjetoRanking[],
  notas: NotaRanking[],
): LinhaRanking[] {
  const desempate = criterios
    .filter((c) => c.prioridadeDesempate != null)
    .sort((a, b) => a.prioridadeDesempate! - b.prioridadeDesempate!);

  const linhas = projetos.map((projeto) => {
    const doProjeto = notas.filter((n) => n.projetoId === projeto.id);
    const medias: Record<string, number | null> = {};
    for (const c of criterios) {
      const valores = doProjeto.filter((n) => n.criterioId === c.id).map((n) => n.nota);
      medias[c.id] = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    }
    const notaFinal = calcularNotaFinal(medias, criterios);
    return {
      projeto,
      linha: {
        projetoId: projeto.id,
        posicao: null as number | null,
        notaFinal,
        mediasPorCriterio: medias,
        jurados: new Set(doProjeto.map((n) => n.juradoId)).size,
        completo: criterios.length > 0 && criterios.every((c) => medias[c.id] != null),
      },
    };
  });

  const comparar = (a: (typeof linhas)[number], b: (typeof linhas)[number]) => {
    const fa = a.linha.notaFinal;
    const fb = b.linha.notaFinal;
    if (fa == null || fb == null) return fa == null && fb == null ? 0 : fa == null ? 1 : -1;
    if (Math.abs(fa - fb) > EPS) return fb - fa;

    for (const c of desempate) {
      const ma = a.linha.mediasPorCriterio[c.id] ?? -Infinity;
      const mb = b.linha.mediasPorCriterio[c.id] ?? -Infinity;
      if (Math.abs(ma - mb) > EPS) return mb - ma;
    }

    const ea = a.projeto.enviadoEm?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const eb = b.projeto.enviadoEm?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return ea - eb;
  };

  linhas.sort(comparar);

  linhas.forEach((item, i) => {
    if (item.linha.notaFinal == null) return;
    const anterior = linhas[i - 1];
    item.linha.posicao = anterior && anterior.linha.notaFinal != null && comparar(anterior, item) === 0
      ? anterior.linha.posicao
      : i + 1;
  });

  return linhas.map(({ linha }) => ({
    ...linha,
    notaFinal: linha.notaFinal == null ? null : arred(linha.notaFinal),
    mediasPorCriterio: Object.fromEntries(
      Object.entries(linha.mediasPorCriterio).map(([k, v]) => [k, v == null ? null : arred(v)]),
    ),
  }));
}
