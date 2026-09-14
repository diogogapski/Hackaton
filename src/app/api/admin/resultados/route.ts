import { parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";
import { gerarResultados } from "@/src/server/avaliacao/resultados";

/** Prévia completa do ranking (com notas), publicada ou não. */
export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });

  return Response.json({
    hackathon: {
      id: hackathon.id,
      nome: hackathon.nome,
      resultadosPublicados: hackathon.resultadosPublicados,
      resultadosPublicadosEm: hackathon.resultadosPublicadosEm,
      exibirNotasPublicas: hackathon.exibirNotasPublicas,
    },
    ...(await gerarResultados(hackathon.id)),
  });
});
