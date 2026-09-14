/**
 * Comunicado automático de mudança na agenda (canvas: "a comissão altera uma vez e a mudança chega a
 * todos"; métrica: 100% das mudanças comunicadas por um único canal). Função pura, sem banco.
 */

export type ItemAgenda = {
  titulo: string;
  horarioInicio: Date;
  horarioFim: Date | null;
  local: string | null;
  cancelado: boolean;
};

const FUSO = "America/Sao_Paulo";
const dataHora = (d: Date) =>
  d.toLocaleString("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const hora = (d: Date) => d.toLocaleTimeString("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" });
// Compara no minuto: o formulário de agenda envia horários sem segundos.
const minuto = (d: Date | null) => (d ? Math.floor(d.getTime() / 60_000) : null);
const mesmoInstante = (a: Date | null, b: Date | null) => minuto(a) === minuto(b);

export function descreverMudancaAgenda(antes: ItemAgenda, depois: ItemAgenda): { titulo: string; conteudo: string } | null {
  if (!antes.cancelado && depois.cancelado) {
    return {
      titulo: `Agenda: "${depois.titulo}" foi cancelada`,
      conteudo: `A atividade "${depois.titulo}", prevista para ${dataHora(depois.horarioInicio)}${depois.local ? ` em ${depois.local}` : ""}, foi cancelada.`,
    };
  }
  if (antes.cancelado && !depois.cancelado) {
    return {
      titulo: `Agenda: "${depois.titulo}" está confirmada novamente`,
      conteudo: `A atividade "${depois.titulo}" volta a acontecer em ${dataHora(depois.horarioInicio)}${depois.local ? ` em ${depois.local}` : ""}.`,
    };
  }
  if (depois.cancelado) return null; // mudanças numa atividade cancelada não interessam ao público

  const mudancas: string[] = [];
  if (antes.titulo !== depois.titulo) mudancas.push(`nome: "${antes.titulo}" -> "${depois.titulo}"`);
  if (!mesmoInstante(antes.horarioInicio, depois.horarioInicio)) {
    mudancas.push(`início: ${dataHora(antes.horarioInicio)} -> ${dataHora(depois.horarioInicio)}`);
  }
  if (!mesmoInstante(antes.horarioFim, depois.horarioFim)) {
    mudancas.push(`término: ${antes.horarioFim ? hora(antes.horarioFim) : "sem horário"} -> ${depois.horarioFim ? hora(depois.horarioFim) : "sem horário"}`);
  }
  if ((antes.local ?? "") !== (depois.local ?? "")) {
    mudancas.push(`local: ${antes.local ?? "a definir"} -> ${depois.local ?? "a definir"}`);
  }
  if (mudancas.length === 0) return null;

  return {
    titulo: `Agenda: mudança em "${depois.titulo}"`,
    conteudo: `A atividade "${depois.titulo}" foi alterada — ${mudancas.join("; ")}.`,
  };
}

export function descreverRemocaoAgenda(item: ItemAgenda) {
  return {
    titulo: `Agenda: "${item.titulo}" saiu da programação`,
    conteudo: `A atividade "${item.titulo}", que estava prevista para ${dataHora(item.horarioInicio)}${item.local ? ` em ${item.local}` : ""}, foi retirada da programação.`,
  };
}
