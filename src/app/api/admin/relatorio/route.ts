import { parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";
import { relatorioConsolidado } from "@/src/server/operacao/relatorio";

/** Relatório consolidado da edição para a coordenação (prestação de contas). */
export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });
  return Response.json(await relatorioConsolidado(hackathon.id));
});
