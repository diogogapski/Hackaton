import { prisma } from "@/src/lib/db";
import { anonimizarConta } from "@/src/server/identidade/usuarios";

type Edicao = { id: string; status: string; dataFim: Date; retencaoDadosDias: number | null };

/** Data a partir da qual os dados da edição podem ser descartados; null se o prazo não se aplica. */
export function prazoDescarte(h: Edicao) {
  if (h.status !== "ENCERRADO" || h.retencaoDadosDias == null) return null;
  return new Date(h.dataFim.getTime() + h.retencaoDadosDias * 864e5);
}

const prazoVencido = (h: Edicao, agora: Date) => {
  const prazo = prazoDescarte(h);
  return prazo != null && prazo <= agora;
};

/**
 * Contas elegíveis ao descarte (canvas/LGPD: "prazo de descarte definido"): quem participou (equipe) ou
 * avaliou (jurado) na edição, desde que TODAS as edições a que a pessoa está ligada já tenham passado do
 * prazo. Administradores nunca entram. Nada é apagado aqui — só a lista.
 */
export async function contasParaDescarte(hackathonId: string, agora = new Date()) {
  const edicao = await prisma.hackathon.findUniqueOrThrow({ where: { id: hackathonId } });
  const prazo = prazoDescarte(edicao);
  if (!prazo || prazo > agora) return { edicao, prazo, liberado: false, contas: [] as { id: string; nome: string; papel: string }[] };

  const edicoes = await prisma.hackathon.findMany({ select: { id: true, status: true, dataFim: true, retencaoDadosDias: true } });
  const vencidas = new Set(edicoes.filter((h) => prazoVencido(h, agora)).map((h) => h.id));

  const candidatos = await prisma.user.findMany({
    where: {
      anonimizadoEm: null,
      papel: { not: "ADMIN" },
      OR: [
        { participacoes: { some: { team: { hackathonId } } } },
        { atribuicoes: { some: { projeto: { hackathonId } } } },
      ],
    },
    select: {
      id: true,
      nome: true,
      papel: true,
      participacoes: { select: { team: { select: { hackathonId: true } } } },
      atribuicoes: { select: { projeto: { select: { hackathonId: true } } } },
    },
  });

  const contas = candidatos
    .filter((u) =>
      [...u.participacoes.map((p) => p.team.hackathonId), ...u.atribuicoes.map((a) => a.projeto.hackathonId)].every((id) => vencidas.has(id)),
    )
    .map(({ id, nome, papel }) => ({ id, nome, papel }));

  return { edicao, prazo, liberado: true, contas };
}

/** Anonimiza as contas elegíveis. Disparo sempre manual pela comissão. */
export async function executarDescarte(hackathonId: string) {
  const { liberado, contas, prazo } = await contasParaDescarte(hackathonId);
  if (!liberado) return { liberado, prazo, anonimizadas: 0 };
  for (const conta of contas) await anonimizarConta(conta.id);
  return { liberado, prazo, anonimizadas: contas.length };
}
