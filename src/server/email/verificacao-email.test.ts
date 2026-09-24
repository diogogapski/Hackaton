import assert from "node:assert/strict";
import test from "node:test";
import { conteudoVerificacaoEmail, linkVerificacao } from "./verificacao-email";

test("link de verificação codifica o token", () => {
  assert.equal(
    linkVerificacao("https://hackif.dev/", "token com +"),
    "https://hackif.dev/verificar-email?token=token+com+%2B",
  );
});

test("template de verificação escapa nome e link", () => {
  const conteudo = conteudoVerificacaoEmail("<img src=x>", "https://hackif.dev/?a=1&b=2", false);
  assert.doesNotMatch(conteudo.html, /<img src=x>/);
  assert.match(conteudo.html, /&lt;img src=x&gt;/);
  assert.match(conteudo.html, /a=1&amp;b=2/);
});

test("troca de endereço usa texto específico", () => {
  const conteudo = conteudoVerificacaoEmail("Ana", "https://hackif.dev", true);
  assert.match(conteudo.subject, /novo e-mail/);
  assert.match(conteudo.text, /confirmar seu novo e-mail/);
});
