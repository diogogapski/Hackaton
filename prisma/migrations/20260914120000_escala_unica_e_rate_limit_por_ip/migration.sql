-- CreateTable
CREATE TABLE "TentativaAcesso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "acao" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Criterio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hackathonId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "peso" REAL NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "prioridadeDesempate" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Criterio_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Criterio" ("atualizadoEm", "criadoEm", "descricao", "hackathonId", "id", "nome", "ordem", "peso", "prioridadeDesempate") SELECT "atualizadoEm", "criadoEm", "descricao", "hackathonId", "id", "nome", "ordem", "peso", "prioridadeDesempate" FROM "Criterio";
DROP TABLE "Criterio";
ALTER TABLE "new_Criterio" RENAME TO "Criterio";
CREATE INDEX "Criterio_hackathonId_idx" ON "Criterio"("hackathonId");
CREATE TABLE "new_Hackathon" (
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
    "notaMin" REAL NOT NULL DEFAULT 0,
    "notaMax" REAL NOT NULL DEFAULT 10,
    "regulamentoUrl" TEXT,
    "regulamentoTexto" TEXT,
    "resultadosPublicados" BOOLEAN NOT NULL DEFAULT false,
    "resultadosPublicadosEm" DATETIME,
    "exibirNotasPublicas" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);
INSERT INTO "new_Hackathon" ("atualizadoEm", "criadoEm", "dataFim", "dataInicio", "descricao", "exibirNotasPublicas", "id", "inscricaoFim", "inscricaoInicio", "juradosPorProjeto", "limiteMaxIntegrantes", "limiteMinIntegrantes", "nome", "permitirEdicaoAvaliacao", "prazoSubmissao", "regulamentoTexto", "regulamentoUrl", "resultadosPublicados", "resultadosPublicadosEm", "status") SELECT "atualizadoEm", "criadoEm", "dataFim", "dataInicio", "descricao", "exibirNotasPublicas", "id", "inscricaoFim", "inscricaoInicio", "juradosPorProjeto", "limiteMaxIntegrantes", "limiteMinIntegrantes", "nome", "permitirEdicaoAvaliacao", "prazoSubmissao", "regulamentoTexto", "regulamentoUrl", "resultadosPublicados", "resultadosPublicadosEm", "status" FROM "Hackathon";
DROP TABLE "Hackathon";
ALTER TABLE "new_Hackathon" RENAME TO "Hackathon";
CREATE INDEX "Hackathon_status_idx" ON "Hackathon"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TentativaAcesso_acao_ip_criadoEm_idx" ON "TentativaAcesso"("acao", "ip", "criadoEm");

-- CreateIndex
CREATE INDEX "TentativaAcesso_criadoEm_idx" ON "TentativaAcesso"("criadoEm");
