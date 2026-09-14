import { z } from "zod";
import { badRequest, parseBody, parseQuery, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { resolveHackathon } from "@/src/server/hackathon/atual";
import { hackathonIdQuerySchema } from "@/src/server/hackathon/schemas";
import { contasParaDescarte, executarDescarte } from "@/src/server/operacao/expurgo";

/** Prévia: prazo de descarte da edição e quantas contas seriam anonimizadas. */
export const GET = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = parseQuery(request, hackathonIdQuerySchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });
  const { prazo, liberado, contas } = await contasParaDescarte(hackathon.id);
  return Response.json({
    hackathon: { id: hackathon.id, nome: hackathon.nome, status: hackathon.status, retencaoDadosDias: hackathon.retencaoDadosDias },
    prazo,
    liberado,
    motivo: liberado ? null : hackathon.retencaoDadosDias == null
      ? "Defina a retenção de dados pessoais (dias) nas configurações da edição"
      : hackathon.status !== "ENCERRADO" ? "A edição precisa estar ENCERRADA" : "O prazo de retenção ainda não venceu",
    total: contas.length,
    contas,
  });
});

const executarSchema = z.object({
  hackathonId: z.string().optional(),
  confirmar: z.literal(true, { error: "Envie confirmar: true para anonimizar as contas" }),
});

/** Executa o descarte (anonimização) das contas elegíveis. Irreversível: exige confirmação explícita. */
export const POST = route(async (request) => {
  await requireRole("ADMIN");
  const { hackathonId } = await parseBody(request, executarSchema);
  const hackathon = await resolveHackathon(hackathonId, { incluirRascunho: true });
  const resultado = await executarDescarte(hackathon.id);
  if (!resultado.liberado) throw badRequest("Descarte não liberado para esta edição (veja a prévia)");
  return Response.json(resultado);
});
