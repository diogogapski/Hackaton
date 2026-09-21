import { test } from "node:test";
import assert from "node:assert/strict";
import { projetoUpdateSchema, hackathonUpdateSchema } from "./schemas";

test("URLs malformadas e protocolos executáveis são rejeitados sem lançar exceção", () => {
  for (const url of ["nao-e-url", "javascript:alert(1)", "data:text/html,test", "file:///tmp/test"]) {
    assert.equal(projetoUpdateSchema.safeParse({ links: [{ tipo: "site", url }] }).success, false);
    assert.equal(projetoUpdateSchema.safeParse({ arquivos: [{ nome: "pitch", url }] }).success, false);
    assert.equal(hackathonUpdateSchema.safeParse({ regulamentoUrl: url }).success, false);
  }
});

test("links de projeto e regulamento aceitam http e https", () => {
  for (const url of ["https://example.com/projeto", "http://example.com/regulamento"]) {
    assert.equal(projetoUpdateSchema.safeParse({ links: [{ tipo: "site", url }] }).success, true);
    assert.equal(hackathonUpdateSchema.safeParse({ regulamentoUrl: url }).success, true);
  }
});
