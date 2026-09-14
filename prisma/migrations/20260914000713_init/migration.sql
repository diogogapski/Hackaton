-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "vinculo" TEXT NOT NULL,
    "matricula" TEXT,
    "siape" TEXT,
    "cpf" TEXT,
    "curso" TEXT,
    "telefone" TEXT,
    "papel" TEXT NOT NULL DEFAULT 'PARTICIPANTE',
    "situacao" TEXT NOT NULL DEFAULT 'ATIVO',
    "termosAceitosEm" DATETIME,
    "anonimizadoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEm" DATETIME NOT NULL,
    "usadoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "liderId" TEXT,
    "situacao" TEXT NOT NULL DEFAULT 'EM_FORMACAO',
    "codigoConvite" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Team_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entrouEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "saiuEm" DATETIME,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hackathon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "inscricaoInicio" DATETIME,
    "inscricaoFim" DATETIME,
    "prazoSubmissao" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "limiteMinIntegrantes" INTEGER NOT NULL DEFAULT 3,
    "limiteMaxIntegrantes" INTEGER NOT NULL DEFAULT 5,
    "juradosPorProjeto" INTEGER NOT NULL DEFAULT 3,
    "permitirEdicaoAvaliacao" BOOLEAN NOT NULL DEFAULT true,
    "regulamentoUrl" TEXT,
    "regulamentoTexto" TEXT,
    "resultadosPublicados" BOOLEAN NOT NULL DEFAULT false,
    "resultadosPublicadosEm" DATETIME,
    "exibirNotasPublicas" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Desafio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "responsavel" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Desafio_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgendaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "horarioInicio" DATETIME NOT NULL,
    "horarioFim" DATETIME,
    "local" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "AgendaItem_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "desafioId" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "solucao" TEXT,
    "tecnologias" JSONB NOT NULL,
    "links" JSONB NOT NULL,
    "arquivos" JSONB NOT NULL,
    "situacao" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "enviadoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Projeto_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Projeto_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Projeto_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES "Desafio" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Criterio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "peso" REAL NOT NULL DEFAULT 1,
    "notaMin" REAL NOT NULL DEFAULT 0,
    "notaMax" REAL NOT NULL DEFAULT 10,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "prioridadeDesempate" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Criterio_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AvaliacaoAtribuicao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "juradoId" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvaliacaoAtribuicao_juradoId_fkey" FOREIGN KEY ("juradoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AvaliacaoAtribuicao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projetoId" TEXT NOT NULL,
    "juradoId" TEXT NOT NULL,
    "criterioId" TEXT NOT NULL,
    "nota" REAL NOT NULL,
    "comentario" TEXT,
    "avaliadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_juradoId_fkey" FOREIGN KEY ("juradoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "Criterio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comunicado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "autorId" TEXT,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "publicadoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Comunicado_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comunicado_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
