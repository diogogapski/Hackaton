import { connection } from "next/server";
import { prisma } from "@/src/lib/db";
import { getHackathonAtual, inscricoesAbertas, submissaoAberta } from "@/src/server/hackathon/atual";
import { gerarResultados } from "@/src/server/avaliacao/resultados";

export type DadosHome = Awaited<ReturnType<typeof carregarDadosHome>>;

/**
 * Dados da edição vigente para a Home. Roda por requisição (nunca no build, quando o banco
 * pode ainda não ter migrations) e nunca derruba a página: sem banco, cada seção usa o texto padrão.
 */
export async function carregarDadosHome() {
  await connection();
  try {
    const h = await getHackathonAtual();
    if (!h) return null;

    const [desafios, criterios, equipesInscritas, resultados] = await Promise.all([
      prisma.desafio.findMany({
        where: { hackathonId: h.id, publicado: true },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
        select: { id: true, titulo: true, descricao: true, categoria: true },
      }),
      prisma.criterio.findMany({
        where: { hackathonId: h.id },
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
        select: { nome: true, peso: true },
      }),
      prisma.team.count({ where: { hackathonId: h.id, situacao: "INSCRITA" } }),
      h.resultadosPublicados ? gerarResultados(h.id) : null,
    ]);

    return {
      nome: h.nome,
      status: h.status,
      dataInicio: h.dataInicio,
      dataFim: h.dataFim,
      inscricaoFim: h.inscricaoFim,
      prazoSubmissao: h.prazoSubmissao ?? h.dataFim,
      limiteMinIntegrantes: h.limiteMinIntegrantes,
      limiteMaxIntegrantes: h.limiteMaxIntegrantes,
      notaMin: h.notaMin,
      notaMax: h.notaMax,
      inscricoesAbertas: inscricoesAbertas(h),
      submissaoAberta: submissaoAberta(h),
      duracaoHoras: Math.round((h.dataFim.getTime() - h.dataInicio.getTime()) / 3_600_000),
      equipesInscritas,
      desafios,
      criterios,
      vencedores: resultados
        ? resultados.ranking
            .filter((l) => l.posicao != null && l.posicao <= 3)
            .slice(0, 3)
            .map((l) => ({ posicao: l.posicao!, projeto: l.projeto.nome, equipe: l.equipe.nome, desafio: l.projeto.desafio?.titulo ?? null }))
        : null,
    };
  } catch (error) {
    console.error("[home] não foi possível carregar dados da edição", error);
    return null;
  }
}

export const doisDigitos = (n: number) => String(n).padStart(2, "0");

export function rotuloStatus(dados: DadosHome) {
  if (!dados) return "EM BREVE";
  if (dados.vencedores) return "RESULTADOS PUBLICADOS";
  if (dados.inscricoesAbertas) return "INSCRIÇÕES ABERTAS";
  return { INSCRICOES_ABERTAS: "INSCRIÇÕES ENCERRADAS", EM_ANDAMENTO: "EM ANDAMENTO", ENCERRADO: "ENCERRADO", RASCUNHO: "EM BREVE" }[dados.status];
}
