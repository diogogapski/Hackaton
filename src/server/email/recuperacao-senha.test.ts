import assert from "node:assert/strict";
import test from "node:test";
import {
  ErroConfiguracaoEmail,
  conteudoRecuperacaoSenha,
  linkRedefinicao,
  obterConfiguracaoEmail,
} from "./recuperacao-senha";

test("desenvolvimento usa console por padrão", () => {
  assert.deepEqual(obterConfiguracaoEmail({ NODE_ENV: "development" }), {
    provedor: "console",
    appUrl: "http://localhost:3000",
  });
});

test("produção exige credenciais da Resend", () => {
  assert.throws(() => obterConfiguracaoEmail({ NODE_ENV: "production", APP_URL: "https://hackif.dev" }), ErroConfiguracaoEmail);
});

test("produção não permite registrar tokens no console", () => {
  assert.throws(
    () => obterConfiguracaoEmail({ NODE_ENV: "production", EMAIL_PROVIDER: "console" }),
    ErroConfiguracaoEmail,
  );
});

test("produção aceita o domínio público da Railway", () => {
  assert.deepEqual(obterConfiguracaoEmail({
    NODE_ENV: "production",
    RAILWAY_PUBLIC_DOMAIN: "hackif.up.railway.app",
    RESEND_API_KEY: "re_teste",
    EMAIL_FROM: "HACKIF <nao-responda@hackif.dev>",
  }), {
    provedor: "resend",
    appUrl: "https://hackif.up.railway.app",
    apiKey: "re_teste",
    remetente: "HACKIF <nao-responda@hackif.dev>",
  });
});

test("link codifica o token e remove barra duplicada", () => {
  assert.equal(
    linkRedefinicao("https://hackif.dev/", "token com +"),
    "https://hackif.dev/redefinir-senha?token=token+com+%2B",
  );
});

test("template escapa dados inseridos no HTML", () => {
  const conteudo = conteudoRecuperacaoSenha("<script>alert('x')</script>", "https://hackif.dev/?a=1&b=2");
  assert.doesNotMatch(conteudo.html, /<script>/);
  assert.match(conteudo.html, /&lt;script&gt;/);
  assert.match(conteudo.html, /a=1&amp;b=2/);
});
