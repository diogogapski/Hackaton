/** CSV com separador ";" e BOM, para abrir direto no Excel em português. Função pura. */
export function paraCsv(linhas: Record<string, unknown>[]) {
  if (linhas.length === 0) return "﻿";
  const colunas = Object.keys(linhas[0]);
  const celula = (v: unknown) => {
    let texto = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
    // Evita injeção de fórmula: texto digitado por usuários não pode começar como fórmula de planilha.
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
    return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  return "﻿" + [colunas.join(";"), ...linhas.map((l) => colunas.map((c) => celula(l[c])).join(";"))].join("\r\n");
}
