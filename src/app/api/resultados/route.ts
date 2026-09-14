import { parseQuery, route } from "@/src/lib/http";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";
import { gerarResultados } from "@/src/server/avaliacao/resultados";

/** Público. Só retorna ranking depois da publicação manual pelo admin. */
export const GET = route(async (request) => {
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId);

  if (!hackathon.resultadosPublicados) {
    return Response.json({ publicado: false, ranking: [] });
  }

  const { criterios, ranking } = await gerarResultados(hackathon.id);
  const comNotas = hackathon.exibirNotasPublicas;

  return Response.json({
    publicado: true,
    publicadoEm: hackathon.resultadosPublicadosEm,
    criterios: comNotas ? criterios : undefined,
    ranking: ranking
      .filter((l) => l.posicao != null)
      .map((l) => ({
        posicao: l.posicao,
        equipe: l.equipe,
        projeto: l.projeto,
        ...(comNotas && { notaFinal: l.notaFinal, mediasPorCriterio: l.mediasPorCriterio }),
      })),
  });
});
