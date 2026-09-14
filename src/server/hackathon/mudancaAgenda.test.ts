import { test } from "node:test";
import assert from "node:assert/strict";
import { descreverMudancaAgenda, descreverRemocaoAgenda, type ItemAgenda } from "./mudancaAgenda";

const base: ItemAgenda = {
  titulo: "Abertura",
  horarioInicio: new Date("2026-10-04T11:00:00Z"), // 08:00 em Brasília
  horarioFim: new Date("2026-10-04T12:00:00Z"),
  local: "Auditório",
  cancelado: false,
};

test("sem mudança relevante não gera comunicado", () => {
  assert.equal(descreverMudancaAgenda(base, { ...base }), null);
});

test("salvar pelo formulário (horário sem segundos) não gera comunicado falso", () => {
  const comSegundos = { ...base, horarioInicio: new Date("2026-10-04T11:00:37.512Z") };
  assert.equal(descreverMudancaAgenda(comSegundos, { ...comSegundos, horarioInicio: new Date("2026-10-04T11:00:00Z") }), null);
});

test("cancelamento gera comunicado de cancelamento", () => {
  const c = descreverMudancaAgenda(base, { ...base, cancelado: true });
  assert.match(c!.titulo, /cancelada/);
  assert.match(c!.conteudo, /04\/10.*08:00.*Auditório/);
});

test("reativação gera comunicado", () => {
  assert.match(descreverMudancaAgenda({ ...base, cancelado: true }, base)!.titulo, /confirmada novamente/);
});

test("mudança de horário e sala lista antes e depois no horário de Brasília", () => {
  const c = descreverMudancaAgenda(base, { ...base, horarioInicio: new Date("2026-10-04T13:30:00Z"), local: "Lab 2" });
  assert.match(c!.conteudo, /início: 04\/10.*08:00 -> 04\/10.*10:30/);
  assert.match(c!.conteudo, /local: Auditório -> Lab 2/);
});

test("alterar atividade já cancelada não comunica", () => {
  assert.equal(descreverMudancaAgenda({ ...base, cancelado: true }, { ...base, cancelado: true, local: "Lab 2" }), null);
});

test("remoção descreve a atividade retirada", () => {
  assert.match(descreverRemocaoAgenda(base).titulo, /saiu da programação/);
});
