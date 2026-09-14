import { prisma } from "@/src/lib/db";
import { badRequest, conflict, notFound, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { hackathonUpdateSchema, validarHackathon } from "@/src/server/hackathon/schemas";
import { promoverListaEspera } from "@/src/server/equipes/service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: { _count: { select: { equipes: true, projetos: true, desafios: true, criterios: true } } },
  });
  if (!hackathon) throw notFound("Hackathon não encontrado");
  return Response.json({ hackathon });
});

export const PUT = route<Ctx>(async (request, { params }) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const data = await parseBody(request, hackathonUpdateSchema);

  const atual = await prisma.hackathon.findUnique({ where: { id } });
  if (!atual) throw notFound("Hackathon não encontrado");

  const erros = validarHackathon({ ...atual, ...data });
  if (erros.length) throw badRequest("Dados inválidos", erros);

  const mudaEscala =
    (data.notaMin !== undefined && data.notaMin !== atual.notaMin) ||
    (data.notaMax !== undefined && data.notaMax !== atual.notaMax);
  if (mudaEscala && (await prisma.avaliacao.count({ where: { projeto: { hackathonId: id } } })) > 0) {
    throw conflict("A escala de notas não pode mudar depois que há avaliações registradas");
  }

  const hackathon = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.hackathon.update({ where: { id }, data });
    // Limite de equipes aumentou ou foi removido: equipes da lista de espera assumem as vagas.
    if (data.limiteEquipes !== undefined && data.limiteEquipes !== atual.limiteEquipes) {
      await promoverListaEspera(tx, id);
    }
    return atualizado;
  });
  return Response.json({ hackathon });
});
