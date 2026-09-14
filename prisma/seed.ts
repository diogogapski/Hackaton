/**
 * Seed de desenvolvimento (idempotente). Senha de todos: Senha@123
 *
 *   admin@hackif.dev       ADMIN
 *   jurado@hackif.dev      JURADO     (+ jurado2@hackif.dev)
 *   aluno@hackif.dev       ALUNO      matrícula 20260001  (líder da equipe)
 *   aluna2@hackif.dev      ALUNO      matrícula 20260002
 *   servidor@hackif.dev    SERVIDOR   SIAPE 1234567
 *   externo@hackif.dev     EXTERNO    (sem equipe)
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import type { Papel, Vinculo } from "../src/generated/prisma/enums";

if (process.env.NODE_ENV === "production") {
  console.error("Seed de desenvolvimento não deve rodar em produção (use npm run admin:create).");
  process.exit(1);
}

const dias = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function main() {
  const senhaHash = await bcrypt.hash("Senha@123", 10);

  const usuario = (email: string, nome: string, vinculo: Vinculo, papel: Papel, extra: object = {}) =>
    prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, nome, vinculo, papel, senhaHash, termosAceitosEm: new Date(), ...extra },
    });

  const admin = await usuario("admin@hackif.dev", "Admin HackIF", "SERVIDOR", "ADMIN", { siape: "0000001" });
  const jurado = await usuario("jurado@hackif.dev", "Jurada Exemplo", "SERVIDOR", "JURADO", { siape: "7654321" });
  await usuario("jurado2@hackif.dev", "Jurado Convidado", "EXTERNO", "JURADO");
  const aluno = await usuario("aluno@hackif.dev", "Aluno Exemplo", "ALUNO", "PARTICIPANTE", {
    matricula: "20260001",
    curso: "Ciência da Computação",
  });
  const aluna2 = await usuario("aluna2@hackif.dev", "Aluna Exemplo", "ALUNO", "PARTICIPANTE", {
    matricula: "20260002",
    curso: "Ciência da Computação",
  });
  const servidor = await usuario("servidor@hackif.dev", "Servidor Exemplo", "SERVIDOR", "PARTICIPANTE", {
    siape: "1234567",
  });
  await usuario("externo@hackif.dev", "Pessoa Externa", "EXTERNO", "PARTICIPANTE");

  const NOME_EDICAO = "1º HackIF — IFPR Campus Pinhais";
  let hackathon = await prisma.hackathon.findFirst({ where: { nome: NOME_EDICAO } });
  if (!hackathon) {
    hackathon = await prisma.hackathon.create({
      data: {
        nome: NOME_EDICAO,
        descricao: "Primeiro hackathon do curso de Ciência da Computação do IFPR Campus Pinhais.",
        dataInicio: dias(20),
        dataFim: dias(22),
        inscricaoInicio: dias(-5),
        inscricaoFim: dias(15),
        prazoSubmissao: dias(22),
        status: "INSCRICOES_ABERTAS",
        local: "IFPR Campus Pinhais",
        limiteMinIntegrantes: 3,
        limiteMaxIntegrantes: 5,
        juradosPorProjeto: 2,
        notaMin: 0,
        notaMax: 10,
        regulamentoTexto: "Regulamento de exemplo.",
        desafios: {
          create: [
            { titulo: "Campus Inteligente", descricao: "Soluções para o dia a dia no campus.", categoria: "Educação", publicado: true, ordem: 1 },
            { titulo: "Cidade Sustentável", descricao: "Tecnologia para Pinhais mais sustentável.", categoria: "Sustentabilidade", publicado: true, ordem: 2 },
          ],
        },
        agenda: {
          create: [
            { titulo: "Abertura", horarioInicio: dias(20), local: "Auditório" },
            { titulo: "Início do desenvolvimento", horarioInicio: dias(20.1), local: "Laboratórios" },
            { titulo: "Apresentações finais", horarioInicio: dias(22), local: "Auditório" },
          ],
        },
        criterios: {
          create: [
            { nome: "Inovação", peso: 2, ordem: 1, prioridadeDesempate: 1 },
            { nome: "Execução técnica", peso: 2, ordem: 2, prioridadeDesempate: 2 },
            { nome: "Impacto", peso: 1, ordem: 3 },
            { nome: "Apresentação", peso: 1, ordem: 4 },
          ],
        },
        comunicados: {
          create: [{ titulo: "Inscrições abertas!", conteudo: "Monte sua equipe de 3 a 5 pessoas.", publicadoEm: new Date(), autorId: admin.id }],
        },
      },
    });
  }

  let equipe = await prisma.team.findFirst({ where: { hackathonId: hackathon.id, nome: "Equipe Exemplo" } });
  if (!equipe) {
    const desafio = await prisma.desafio.findFirst({ where: { hackathonId: hackathon.id }, orderBy: { ordem: "asc" } });
    equipe = await prisma.team.create({
      data: {
        nome: "Equipe Exemplo",
        hackathonId: hackathon.id,
        liderId: aluno.id,
        situacao: "INSCRITA",
        codigoConvite: "HACKIF01",
        membros: { create: [{ userId: aluno.id }, { userId: aluna2.id }, { userId: servidor.id }] },
        projeto: {
          create: {
            hackathonId: hackathon.id,
            desafioId: desafio?.id,
            nome: "Mapa do Campus",
            descricao: "Mapa interativo com salas, horários e eventos do campus.",
            solucao: "PWA com mapa vetorial e integração com a agenda.",
            tecnologias: ["Next.js", "Prisma", "SQLite"],
            links: [{ tipo: "repositorio", url: "https://github.com/exemplo/mapa-campus" }],
            arquivos: [],
            situacao: "ENVIADO",
            enviadoEm: new Date(),
          },
        },
      },
      include: { projeto: true },
    });

    const projeto = await prisma.projeto.findUniqueOrThrow({ where: { teamId: equipe.id } });
    await prisma.avaliacaoAtribuicao.create({ data: { juradoId: jurado.id, projetoId: projeto.id } });
  }

  console.log(`Seed ok — hackathon ${hackathon.id}, equipe ${equipe.id}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
