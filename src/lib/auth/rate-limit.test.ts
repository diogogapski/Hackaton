import assert from "node:assert/strict";
import test from "node:test";
import { clientIp, rateLimitKey } from "./rate-limit";

test("usa o endereço adicionado pelo proxy, não o primeiro X-Forwarded-For", () => {
  const request = new Request("https://hackif.test", {
    headers: { "x-forwarded-for": "1.2.3.4, 203.0.113.8" },
  });
  assert.equal(clientIp(request), "203.0.113.8");
});

test("identificador de rate limit não armazena o valor pessoal", () => {
  const chave = rateLimitKey("Pessoa@Exemplo.com");
  assert.equal(chave.length, 64);
  assert.doesNotMatch(chave, /pessoa|exemplo/);
  assert.equal(chave, rateLimitKey(" pessoa@exemplo.COM "));
});
