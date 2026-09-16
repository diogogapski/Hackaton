import { prisma } from "@/src/lib/db";
import { gerarResultados } from "@/src/server/avaliacao/resultados";
import { getHackathonAtual, inscricoesAbertas } from "@/src/server/hackathon/atual";
import type { DadosHome } from "@/src/components/sections/home/types";

export async function carregarDadosHome(): Promise<DadosHome | null> {
  const hackathon = await getHackathonAtual();
  if (!hackathon) return null;

  const [desafio, agenda, resultados] = await Promise.all([
    prisma.desafio.findFirst({
      where: { hackathonId: hackathon.id, publicado: true },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      select: { titulo: true, descricao: true, categoria: true, responsavel: true },
    }),
    prisma.agendaItem.findMany({
      where: { hackathonId: hackathon.id, cancelado: false },
      orderBy: { horarioInicio: "asc" },
      take: 4,
      select: { id: true, titulo: true, horarioInicio: true, horarioFim: true, local: true },
    }),
    hackathon.resultadosPublicados ? gerarResultados(hackathon.id) : Promise.resolve(null),
  ]);

  return {
    edicao: {
      nome: hackathon.nome,
      descricao: hackathon.descricao,
      status: hackathon.status,
      dataInicio: hackathon.dataInicio.toISOString(),
      dataFim: hackathon.dataFim.toISOString(),
      local: hackathon.local,
      limiteMinIntegrantes: hackathon.limiteMinIntegrantes,
      limiteMaxIntegrantes: hackathon.limiteMaxIntegrantes,
      limiteEquipes: hackathon.limiteEquipes,
      inscricoesAbertas: inscricoesAbertas(hackathon),
    },
    desafio,
    agenda: agenda.map((item) => ({
      ...item,
      horarioInicio: item.horarioInicio.toISOString(),
      horarioFim: item.horarioFim?.toISOString() ?? null,
    })),
    vencedores: resultados?.ranking
      .filter((linha) => linha.posicao != null)
      .slice(0, 3)
      .map((linha) => ({
        posicao: linha.posicao!,
        projeto: linha.projeto.nome,
        equipe: linha.equipe.nome,
        desafio: linha.projeto.desafio?.titulo ?? null,
      })) ?? [],
  };
}
