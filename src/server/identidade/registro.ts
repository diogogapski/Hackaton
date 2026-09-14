import { prisma } from "@/src/lib/db";
import { conflict } from "@/src/lib/http";
import { hashPassword } from "@/src/lib/auth/password";
import { createSession } from "@/src/lib/auth/session";
import { publicUserSelect } from "@/src/lib/auth";
import type { Vinculo } from "@/src/generated/prisma/enums";

type NovoUsuario = {
  nome: string;
  email: string;
  senha: string;
  vinculo: Vinculo;
  matricula?: string;
  siape?: string;
  cpf?: string;
  curso?: string;
};

/** Cria a conta (sempre PARTICIPANTE), registra aceite dos termos e inicia a sessão. */
export async function registrarUsuario(input: NovoUsuario) {
  const { senha } = input;
  // Lista explícita: nada além destes campos chega ao banco (ex.: papel, aceiteTermos).
  const dados = {
    nome: input.nome,
    email: input.email,
    vinculo: input.vinculo,
    matricula: input.matricula,
    siape: input.siape,
    cpf: input.cpf,
    curso: input.curso,
  };
  const duplicado = await prisma.user.findFirst({
    where: {
      OR: [
        { email: dados.email },
        ...(dados.matricula ? [{ matricula: dados.matricula }] : []),
        ...(dados.siape ? [{ siape: dados.siape }] : []),
        ...(dados.cpf ? [{ cpf: dados.cpf }] : []),
      ],
    },
    select: { email: true, matricula: true, siape: true, cpf: true },
  });
  if (duplicado) {
    const campo =
      duplicado.email === dados.email ? "e-mail" :
      dados.matricula && duplicado.matricula === dados.matricula ? "matrícula" :
      dados.siape && duplicado.siape === dados.siape ? "SIAPE" : "CPF";
    throw conflict(`Já existe uma conta com este ${campo}`);
  }

  const user = await prisma.user.create({
    data: { ...dados, senhaHash: await hashPassword(senha), termosAceitosEm: new Date() },
    select: publicUserSelect,
  });

  await createSession(user.id);
  return user;
}
