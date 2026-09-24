import { test } from "node:test";
import assert from "node:assert/strict";
import { origemPermitida, parseBody } from "./http";
import { z } from "zod";

const req = (method: string, headers: Record<string, string>) => new Request("http://localhost:3000/api/x", { method, headers });

test("GET nunca é bloqueado", () => {
  assert.equal(origemPermitida(req("GET", { origin: "https://malicioso.com", host: "localhost:3000" })), true);
});

test("POST sem Origin (curl, testes) passa", () => {
  assert.equal(origemPermitida(req("POST", { host: "localhost:3000" })), true);
});

test("POST do próprio site passa", () => {
  assert.equal(origemPermitida(req("POST", { origin: "http://localhost:3000", host: "localhost:3000" })), true);
});

test("POST atrás de proxy usa x-forwarded-host", () => {
  assert.equal(
    origemPermitida(req("PUT", {
      origin: "https://hackif.up.railway.app",
      host: "10.0.0.5:8080",
      "x-forwarded-host": "hackif.up.railway.app",
      "x-forwarded-proto": "https",
    })),
    true,
  );
});

test("POST/PUT/DELETE de outro site são bloqueados", () => {
  for (const m of ["POST", "PUT", "PATCH", "DELETE"]) {
    assert.equal(origemPermitida(req(m, { origin: "https://malicioso.com", host: "localhost:3000" })), false, m);
  }
});

test("Origin inválida é bloqueada", () => {
  assert.equal(origemPermitida(req("POST", { origin: "null", host: "localhost:3000" })), false);
});

test("corpo JSON acima de 64 KiB é rejeitado", async () => {
  const request = new Request("http://localhost/api/x", {
    method: "POST",
    body: JSON.stringify({ texto: "x".repeat(70 * 1024) }),
  });
  await assert.rejects(() => parseBody(request, z.object({ texto: z.string() })), (error: unknown) => (
    error instanceof Error && "status" in error && error.status === 413
  ));
});
