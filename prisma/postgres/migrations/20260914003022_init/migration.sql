-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Vinculo" AS ENUM ('ALUNO', 'SERVIDOR', 'EGRESSO', 'EXTERNO');

-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('PARTICIPANTE', 'JURADO', 'ADMIN');

-- CreateEnum
CREATE TYPE "SituacaoUsuario" AS ENUM ('ATIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "SituacaoEquipe" AS ENUM ('EM_FORMACAO', 'INSCRITA', 'DESCLASSIFICADA');

-- CreateEnum
CREATE TYPE "StatusHackathon" AS ENUM ('RASCUNHO', 'INSCRICOES_ABERTAS', 'EM_ANDAMENTO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "SituacaoProjeto" AS ENUM ('RASCUNHO', 'ENVIADO', 'DESCLASSIFICADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "vinculo" "Vinculo" NOT NULL,
    "matricula" TEXT,
    "siape" TEXT,
    "cpf" TEXT,
    "curso" TEXT,
    "telefone" TEXT,
    "papel" "Papel" NOT NULL DEFAULT 'PARTICIPANTE',
    "situacao" "SituacaoUsuario" NOT NULL DEFAULT 'ATIVO',
    "termosAceitosEm" TIMESTAMP(3),
    "anonimizadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "liderId" TEXT,
    "situacao" "SituacaoEquipe" NOT NULL DEFAULT 'EM_FORMACAO',
    "codigoConvite" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TentativaAcesso" (
    "id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TentativaAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entrouEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saiuEm" TIMESTAMP(3),

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hackathon" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "inscricaoInicio" TIMESTAMP(3),
    "inscricaoFim" TIMESTAMP(3),
    "prazoSubmissao" TIMESTAMP(3),
    "status" "StatusHackathon" NOT NULL DEFAULT 'RASCUNHO',
    "limiteMinIntegrantes" INTEGER NOT NULL DEFAULT 3,
    "limiteMaxIntegrantes" INTEGER NOT NULL DEFAULT 5,
    "juradosPorProjeto" INTEGER NOT NULL DEFAULT 3,
    "permitirEdicaoAvaliacao" BOOLEAN NOT NULL DEFAULT true,
    "notaMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notaMax" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "regulamentoUrl" TEXT,
    "regulamentoTexto" TEXT,
    "resultadosPublicados" BOOLEAN NOT NULL DEFAULT false,
    "resultadosPublicadosEm" TIMESTAMP(3),
    "exibirNotasPublicas" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hackathon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Desafio" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "responsavel" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Desafio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaItem" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "horarioInicio" TIMESTAMP(3) NOT NULL,
    "horarioFim" TIMESTAMP(3),
    "local" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "desafioId" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "solucao" TEXT,
    "tecnologias" JSONB NOT NULL,
    "links" JSONB NOT NULL,
    "arquivos" JSONB NOT NULL,
    "situacao" "SituacaoProjeto" NOT NULL DEFAULT 'RASCUNHO',
    "enviadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criterio" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "peso" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "prioridadeDesempate" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Criterio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoAtribuicao" (
    "id" TEXT NOT NULL,
    "juradoId" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoAtribuicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "juradoId" TEXT NOT NULL,
    "criterioId" TEXT NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT,
    "avaliadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comunicado" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "autorId" TEXT,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "publicadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comunicado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricula_key" ON "User"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "User_siape_key" ON "User"("siape");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_codigoConvite_key" ON "Team"("codigoConvite");

-- CreateIndex
CREATE INDEX "Team_liderId_idx" ON "Team"("liderId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_hackathonId_nome_key" ON "Team"("hackathonId", "nome");

-- CreateIndex
CREATE INDEX "TentativaAcesso_acao_ip_criadoEm_idx" ON "TentativaAcesso"("acao", "ip", "criadoEm");

-- CreateIndex
CREATE INDEX "TentativaAcesso_criadoEm_idx" ON "TentativaAcesso"("criadoEm");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_saiuEm_idx" ON "TeamMember"("teamId", "saiuEm");

-- CreateIndex
CREATE INDEX "TeamMember_userId_saiuEm_idx" ON "TeamMember"("userId", "saiuEm");

-- CreateIndex
CREATE INDEX "Hackathon_status_idx" ON "Hackathon"("status");

-- CreateIndex
CREATE INDEX "Desafio_hackathonId_publicado_idx" ON "Desafio"("hackathonId", "publicado");

-- CreateIndex
CREATE INDEX "AgendaItem_hackathonId_horarioInicio_idx" ON "AgendaItem"("hackathonId", "horarioInicio");

-- CreateIndex
CREATE UNIQUE INDEX "Projeto_teamId_key" ON "Projeto"("teamId");

-- CreateIndex
CREATE INDEX "Projeto_hackathonId_situacao_idx" ON "Projeto"("hackathonId", "situacao");

-- CreateIndex
CREATE INDEX "Criterio_hackathonId_idx" ON "Criterio"("hackathonId");

-- CreateIndex
CREATE INDEX "AvaliacaoAtribuicao_projetoId_idx" ON "AvaliacaoAtribuicao"("projetoId");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoAtribuicao_juradoId_projetoId_key" ON "AvaliacaoAtribuicao"("juradoId", "projetoId");

-- CreateIndex
CREATE INDEX "Avaliacao_juradoId_idx" ON "Avaliacao"("juradoId");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_projetoId_juradoId_criterioId_key" ON "Avaliacao"("projetoId", "juradoId", "criterioId");

-- CreateIndex
CREATE INDEX "Comunicado_hackathonId_publicadoEm_idx" ON "Comunicado"("hackathonId", "publicadoEm");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Desafio" ADD CONSTRAINT "Desafio_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaItem" ADD CONSTRAINT "AgendaItem_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES "Desafio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criterio" ADD CONSTRAINT "Criterio_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoAtribuicao" ADD CONSTRAINT "AvaliacaoAtribuicao_juradoId_fkey" FOREIGN KEY ("juradoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoAtribuicao" ADD CONSTRAINT "AvaliacaoAtribuicao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_juradoId_fkey" FOREIGN KEY ("juradoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "Criterio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

