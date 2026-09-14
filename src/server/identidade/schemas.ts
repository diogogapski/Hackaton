import { z } from "zod";

const senha = z.string().min(8, "A senha deve ter pelo menos 8 caracteres").max(128);
const email = z.email().transform((v) => v.trim().toLowerCase());
const nome = z.string().trim().min(2).max(120);
const aceiteTermos = z.literal(true, { error: "É obrigatório aceitar os termos" });

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function cpfValido(valor: string) {
  const cpf = onlyDigits(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const dig = (len: number) => {
    let soma = 0;
    for (let i = 0; i < len; i++) soma += Number(cpf[i]) * (len + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return dig(9) === Number(cpf[9]) && dig(10) === Number(cpf[10]);
}

export const registerAlunoSchema = z.object({
  nome,
  email,
  senha,
  matricula: z.string().trim().min(3).max(30),
  curso: z.string().trim().min(2).max(120),
  aceiteTermos,
});

export const registerServidorSchema = z.object({
  nome,
  email,
  senha,
  siape: z.string().trim().min(3).max(20),
  aceiteTermos,
});

export const registerExternoSchema = z.object({
  nome,
  email,
  senha,
  vinculo: z.enum(["EGRESSO", "EXTERNO"]),
  // CPF opcional até a comissão decidir (LGPD)
  cpf: z
    .string()
    .refine(cpfValido, "CPF inválido")
    .transform(onlyDigits)
    .optional(),
  aceiteTermos,
});

export const loginSchema = z.object({
  identificador: z.string().trim().min(1),
  vinculo: z.enum(["ALUNO", "SERVIDOR", "EGRESSO", "EXTERNO"]).optional(),
  senha: z.string().min(1),
});

export const recuperarSenhaSchema = z.object({ email });

export const redefinirSenhaSchema = z.object({
  token: z.string().min(10),
  novaSenha: senha,
});

// strictObject: rejeita matricula/siape/cpf/papel etc.
export const perfilUpdateSchema = z.strictObject({
  nome: nome.optional(),
  email: email.optional(),
  telefone: z.string().trim().max(30).nullable().optional(),
});

export const excluirContaSchema = z.object({
  senha: z.string().min(1),
});

export const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: senha,
});

export const adminUsuariosQuerySchema = z.object({
  q: z.string().trim().optional(),
  vinculo: z.enum(["ALUNO", "SERVIDOR", "EGRESSO", "EXTERNO"]).optional(),
  papel: z.enum(["PARTICIPANTE", "JURADO", "ADMIN"]).optional(),
  situacao: z.enum(["ATIVO", "BLOQUEADO"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const alterarPapelSchema = z.object({
  papel: z.enum(["PARTICIPANTE", "JURADO", "ADMIN"]),
});

export const alterarSituacaoUsuarioSchema = z.object({
  situacao: z.enum(["ATIVO", "BLOQUEADO"]),
});
