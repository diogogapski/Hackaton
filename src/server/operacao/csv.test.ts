import { test } from "node:test";
import assert from "node:assert/strict";
import { paraCsv } from "./csv";

test("gera cabeçalho, separador ; e BOM para o Excel", () => {
  assert.equal(paraCsv([{ nome: "Ana", equipe: "T1" }]), "﻿nome;equipe\r\nAna;T1");
});

test("escapa aspas, ponto e vírgula e quebra de linha", () => {
  assert.equal(paraCsv([{ a: 'diz "oi"; tchau' }]), '﻿a\r\n"diz ""oi""; tchau"');
});

test("neutraliza texto que viraria fórmula na planilha", () => {
  const csv = paraCsv([{ equipe: "=HYPERLINK(\"http://x\")", nome: "+5", outro: "@soma", ok: "normal" }]);
  const linha = csv.split("\r\n")[1];
  assert.ok(linha.startsWith(`"'=HYPERLINK(""http://x"")";'+5;'@soma;normal`), linha);
});

test("números e datas não são alterados", () => {
  assert.equal(paraCsv([{ n: -3, d: new Date("2026-10-04T11:00:00Z") }]), "﻿n;d\r\n-3;2026-10-04T11:00:00.000Z");
});

test("lista vazia gera só o BOM", () => {
  assert.equal(paraCsv([]), "﻿");
});
