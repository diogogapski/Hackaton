import { prisma } from "@/src/lib/db";
import { badRequest, notFound, parseBody, route } from "@/src/lib/http";
import { requireRole } from "@/src/lib/auth";
import { agendaUpdateSchema } from "@/src/server/hackathon/schemas";
import { descreverMudancaAgenda, descreverRemocaoAgenda } from "@/src/server/hackathon/mudancaAgenda";

type Ctx = { params: Promise<{ id: string }> };

/** Só edições publicadas e com a opção ligada geram comunicado automático. */
const deveComunicar = (h: { status: string; comunicarMudancasAgenda: boolean }) =>
  h.comunicarMudancasAgenda && h.status !== "RASCUNHO";

export const PUT = route<Ctx>(async (request, { params }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  const data = await parseBody(request, agendaUpdateSchema);

  const atual = await prisma.agendaItem.findUnique({ where: { id }, include: { hackathon: true } });
  if (!atual) throw notFound("Item de agenda não encontrado");
  const inicio = data.horarioInicio ?? atual.horarioInicio;
  const fim = data.horarioFim === undefined ? atual.horarioFim : data.horarioFim;
  if (fim && fim < inicio) throw badRequest("horarioFim anterior ao início");

  const { item, comunicado } = await prisma.$transaction(async (tx) => {
    const item = await tx.agendaItem.update({ where: { id }, data });
    const mudanca = deveComunicar(atual.hackathon) ? descreverMudancaAgenda(atual, item) : null;
    const comunicado = mudanca
      ? await tx.comunicado.create({
          data: { ...mudanca, hackathonId: atual.hackathonId, autorId: admin.id, publicadoEm: new Date(), origem: "AGENDA" },
        })
      : null;
    return { item, comunicado };
  });
  return Response.json({ item, comunicado });
});

export const DELETE = route<Ctx>(async (_request, { params }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await params;

  const atual = await prisma.agendaItem.findUnique({ where: { id }, include: { hackathon: true } });
  if (!atual) throw notFound("Item de agenda não encontrado");

  await prisma.$transaction(async (tx) => {
    await tx.agendaItem.delete({ where: { id } });
    // Remover atividade já cancelada não precisa de novo aviso.
    if (deveComunicar(atual.hackathon) && !atual.cancelado) {
      await tx.comunicado.create({
        data: { ...descreverRemocaoAgenda(atual), hackathonId: atual.hackathonId, autorId: admin.id, publicadoEm: new Date(), origem: "AGENDA" },
      });
    }
  });
  return Response.json({ ok: true });
});
