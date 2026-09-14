import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularNotaFinal, calcularRanking, type CriterioRanking } from "./ranking";

const criterios: CriterioRanking[] = [
  { id: "inov", nome: "Inovação", peso: 2, prioridadeDesempate: 1 },
  { id: "tec", nome: "Técnica", peso: 1, prioridadeDesempate: null },
];

const nota = (projetoId: string, juradoId: string, criterioId: string, n: number) => ({
  projetoId,
  juradoId,
  criterioId,
  nota: n,
});

test("nota final é a média ponderada pelos pesos", () => {
  assert.equal(calcularNotaFinal({ inov: 9, tec: 6 }, criterios), (9 * 2 + 6 * 1) / 3);
});

test("média entre jurados antes de ponderar", () => {
  const [linha] = calcularRanking(criterios, [{ id: "p1", enviadoEm: null }], [
    nota("p1", "j1", "inov", 10),
    nota("p1", "j2", "inov", 6),
    nota("p1", "j1", "tec", 5),
  ]);
  assert.equal(linha.mediasPorCriterio.inov, 8);
  assert.equal(linha.notaFinal, 7);
  assert.equal(linha.jurados, 2);
  assert.equal(linha.completo, true);
});

test("ordena por nota final decrescente", () => {
  const r = calcularRanking(
    criterios,
    [{ id: "a", enviadoEm: null }, { id: "b", enviadoEm: null }],
    [nota("a", "j", "inov", 5), nota("a", "j", "tec", 5), nota("b", "j", "inov", 9), nota("b", "j", "tec", 9)],
  );
  assert.deepEqual(r.map((l) => [l.projetoId, l.posicao]), [["b", 1], ["a", 2]]);
});

test("empate na nota final é decidido pelo critério prioritário", () => {
  // a: inov 7, tec 10 -> (14+10)/3 = 8 ; b: inov 8, tec 8 -> 8
  const r = calcularRanking(
    criterios,
    [{ id: "a", enviadoEm: null }, { id: "b", enviadoEm: null }],
    [nota("a", "j", "inov", 7), nota("a", "j", "tec", 10), nota("b", "j", "inov", 8), nota("b", "j", "tec", 8)],
  );
  assert.deepEqual(r.map((l) => [l.projetoId, l.posicao]), [["b", 1], ["a", 2]]);
});

test("persistindo o empate, quem enviou antes fica à frente", () => {
  const r = calcularRanking(
    criterios,
    [
      { id: "tarde", enviadoEm: new Date("2026-10-02T12:00:00Z") },
      { id: "cedo", enviadoEm: new Date("2026-10-01T12:00:00Z") },
    ],
    [nota("tarde", "j", "inov", 8), nota("tarde", "j", "tec", 8), nota("cedo", "j", "inov", 8), nota("cedo", "j", "tec", 8)],
  );
  assert.deepEqual(r.map((l) => [l.projetoId, l.posicao]), [["cedo", 1], ["tarde", 2]]);
});

test("empate total compartilha a posição e pula a seguinte", () => {
  const r = calcularRanking(
    criterios,
    [{ id: "a", enviadoEm: null }, { id: "b", enviadoEm: null }, { id: "c", enviadoEm: null }],
    [
      nota("a", "j", "inov", 8), nota("a", "j", "tec", 8),
      nota("b", "j", "inov", 8), nota("b", "j", "tec", 8),
      nota("c", "j", "inov", 1), nota("c", "j", "tec", 1),
    ],
  );
  assert.deepEqual(r.map((l) => l.posicao), [1, 1, 3]);
});

test("projeto sem notas fica no fim sem posição", () => {
  const r = calcularRanking(
    criterios,
    [{ id: "vazio", enviadoEm: null }, { id: "ok", enviadoEm: null }],
    [nota("ok", "j", "inov", 5)],
  );
  assert.deepEqual(r.map((l) => [l.projetoId, l.posicao, l.completo]), [["ok", 1, false], ["vazio", null, false]]);
});
